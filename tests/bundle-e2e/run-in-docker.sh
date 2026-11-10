#!/usr/bin/env bash
# Run TimeSpan Playwright browser tests in Podman or Docker.
# Usage:
#   pnpm run test:browser:docker
#   CONTAINER_ENGINE=podman pnpm run test:browser:docker
#   CONTAINER_ENGINE=docker pnpm run test:browser:docker
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

selinux_enforcing() {
  local enforce_file="/sys/fs/selinux/enforce"
  [[ -r "$enforce_file" ]] && [[ "$(cat "$enforce_file" 2>/dev/null || true)" == "1" ]]
}

engine_is_rootless() {
  local engine="$1"
  case "$engine" in
    podman)
      [[ "$(id -u)" != "0" ]]
      ;;
    docker)
      "$engine" info 2>/dev/null | grep -qi 'rootless: true'
      ;;
    *)
      return 1
      ;;
  esac
}

resolve_engine() {
  local requested="${CONTAINER_ENGINE:-}"
  local os
  os="$(uname -s)"

  if [[ -n "$requested" ]]; then
    printf '%s\n' "$requested"
    return 0
  fi

  if [[ "$os" == "Linux" ]] && command -v podman >/dev/null 2>&1; then
    printf '%s\n' podman
    return 0
  fi
  if command -v docker >/dev/null 2>&1; then
    printf '%s\n' docker
    return 0
  fi
  if command -v podman >/dev/null 2>&1; then
    printf '%s\n' podman
    return 0
  fi

  echo "Neither Podman nor Docker is installed." >&2
  echo "On Fedora: sudo dnf install podman" >&2
  echo "Or install Docker and retry. Native Chromium/Firefox: pnpm run test:browser" >&2
  return 1
}

verify_engine() {
  local engine="$1"

  case "$engine" in
    docker | podman) ;;
    *)
      echo "CONTAINER_ENGINE must be 'podman' or 'docker' (got '${engine}')." >&2
      return 1
      ;;
  esac

  if ! command -v "$engine" >/dev/null 2>&1; then
    echo "${engine} is not installed or is not on PATH." >&2
    return 1
  fi

  if ! "$engine" info >/dev/null 2>&1; then
    echo "${engine} is installed but is not running or is inaccessible." >&2
    echo "Start the engine (Podman works rootless; Docker needs its daemon or Docker Desktop) and retry without sudo." >&2
    return 1
  fi
}

bind_mount_opts() {
  local engine="$1"
  local os
  os="$(uname -s)"

  if [[ "$os" != "Linux" ]]; then
    printf '%s\n' ""
    return 0
  fi

  if [[ "$engine" == "podman" ]] || selinux_enforcing; then
    printf '%s\n' ":Z"
    return 0
  fi

  printf '%s\n' ""
}

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required on the host to resolve the Playwright image from pnpm-lock.yaml." >&2
  exit 1
fi

engine="$(resolve_engine)"
verify_engine "$engine"

image="$(node tools/playwright-image.cjs)"
lock_version="$(node tools/playwright-image.cjs --version)"
mount_suffix="$(bind_mount_opts "$engine")"

if [[ "${1:-}" == "--print-config" ]]; then
  echo "engine=${engine}"
  echo "image=${image}"
  echo "playwright=${lock_version}"
  echo "mount_suffix=${mount_suffix}"
  exit 0
fi

echo "Container engine: ${engine}"
echo "Playwright image: ${image}"
echo "Playwright version: ${lock_version}"

if ! "$engine" pull "$image"; then
  echo "Failed to pull ${image} with ${engine}." >&2
  exit 1
fi

mkdir -p "${root}/playwright-report" "${root}/test-results"

run_args=(
  --rm
  --ipc=host
  -e CI="${CI:-1}"
  -e HUSKY=0
  -e HOME=/tmp
  -e npm_config_cache=/tmp/npm-cache
  -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
  -v "${root}:/src${mount_suffix}"
  -v "${root}/playwright-report:/out/playwright-report${mount_suffix}"
  -v "${root}/test-results:/out/test-results${mount_suffix}"
  -w /tmp
)

# Rootless engines map container root to the host user, so bind-mounted
# reports stay owned by the developer. Rootful Docker needs --user.
if [[ "$(id -u)" != "0" ]] && ! engine_is_rootless "$engine"; then
  run_args+=(--user "$(id -u):$(id -g)")
fi

set +e
"$engine" run "${run_args[@]}" "$image" bash -lc "$(cat <<'EOF'
set -euo pipefail
mkdir -p /tmp/work /tmp/npm-cache /out/playwright-report /out/test-results
tar -C /src \
  --exclude=node_modules \
  --exclude=./playwright-report \
  --exclude=./test-results \
  --exclude=coverage \
  --exclude=dist \
  --exclude=./.git \
  --exclude=./reports \
  -cf - . | tar -C /tmp/work -xf -
cd /tmp/work
corepack enable
corepack pnpm install --frozen-lockfile
installed="$(node -p "require('./tests/bundle-e2e/node_modules/@playwright/test/package.json').version")"
expected="$(node tools/playwright-image.cjs --version)"
if [ "$installed" != "$expected" ]; then
  echo "Playwright package ${installed} does not match image version ${expected}." >&2
  exit 1
fi
corepack pnpm run build
set +e
corepack pnpm --filter @undercroft/timespan-bundle-e2e test:playwright
status=$?
set -e
if [ -d playwright-report ]; then
  cp -a playwright-report/. /out/playwright-report/
fi
if [ -d test-results ]; then
  cp -a test-results/. /out/test-results/
fi
exit "$status"
EOF
)"
status=$?
set -e

if [[ "$status" -ne 0 ]]; then
  echo "Containerized Playwright tests failed (exit ${status}). HTML report: playwright-report/" >&2
  exit "$status"
fi

echo "Browser tests passed with ${engine} (${image}). Report: playwright-report/"
exit 0
