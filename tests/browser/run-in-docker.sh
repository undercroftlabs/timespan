#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. On Fedora, use Chromium/Firefox natively or run the suite in GitHub Actions."
  exit 1
fi

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

if [[ ! -f node_modules/@playwright/test/package.json ]]; then
  echo "Install dependencies first: npm ci"
  exit 1
fi

version="$(node -p "require('./node_modules/@playwright/test/package.json').version")"

pull_image() {
  local image="$1"
  docker pull "$image"
}

run_image() {
  local image="$1"
  docker run --rm \
    --ipc=host \
    -e CI="${CI:-1}" \
    -v "${root}:/work" \
    -w /work \
    "$image" \
    npx playwright test
}

for distro in noble jammy; do
  image="mcr.microsoft.com/playwright:v${version}-${distro}"
  echo "Trying Playwright image ${image}"
  if pull_image "$image"; then
    run_image "$image"
    exit 0
  fi
done

echo "Could not pull a Playwright Docker image for v${version} (tried noble and jammy)."
exit 1
