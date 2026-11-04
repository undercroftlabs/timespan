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

image="$(node tools/playwright-image.cjs)"
lock_version="$(node tools/playwright-image.cjs --version)"
installed_version="$(node -p "require('./node_modules/@playwright/test/package.json').version")"

if [[ "$installed_version" != "$lock_version" ]]; then
  echo "Installed @playwright/test ${installed_version} does not match lockfile ${lock_version}."
  exit 1
fi

echo "Using Playwright image ${image}"
docker pull "$image"
docker run --rm \
  --ipc=host \
  -e CI="${CI:-1}" \
  -e HOME=/root \
  -v "${root}:/work" \
  -w /work \
  "$image" \
  npx playwright test
