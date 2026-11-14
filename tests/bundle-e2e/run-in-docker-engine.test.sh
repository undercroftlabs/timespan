#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
script="${root}/tests/bundle-e2e/run-in-docker.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

out="$(CONTAINER_ENGINE=podman bash "$script" --print-config)"
echo "$out" | grep -q '^engine=podman$' || fail "explicit podman"
echo "$out" | grep -q '^image=mcr.microsoft.com/playwright:v' || fail "image tag"

out="$(CONTAINER_ENGINE=docker bash "$script" --print-config)" || true
if command -v docker >/dev/null 2>&1; then
  echo "$out" | grep -q '^engine=docker$' || fail "explicit docker"
else
  CONTAINER_ENGINE=docker bash "$script" --print-config >/dev/null 2>&1 && fail "docker missing should fail"
fi

if CONTAINER_ENGINE=bogus bash "$script" --print-config >/dev/null 2>&1; then
  fail "bogus engine should fail"
fi

os="$(uname -s)"
out="$(bash "$script" --print-config)"
if [[ "$os" == "Linux" ]] && command -v podman >/dev/null 2>&1; then
  echo "$out" | grep -q '^engine=podman$' || fail "linux should prefer podman"
fi

echo "run-in-docker engine detection tests passed."
