# Timespan workspace

This repository contains the `@undercroft/timespan` library and the tests that consume its published build.

Library usage, installation, and the browser bundle are documented in [packages/timespan/README.md](packages/timespan/README.md).

## Requirements

Node.js 22, 24, or 26. The package manager is pnpm 10.23.0.

```bash
pnpm install
```

## Commands

Run these from the repository root.

| Command               | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `pnpm build`          | Build the library                                                   |
| `pnpm test`           | Run unit tests                                                      |
| `pnpm test:cov`       | Run unit tests with coverage                                        |
| `pnpm test:dist`      | Pack and check the built distribution                               |
| `pnpm test:browser`   | Run browser tests against the built bundles                         |
| `pnpm bench`          | Run benchmarks once                                                 |
| `pnpm verify:package` | Pack the library and fail on every publish-gauge finding            |
| `pnpm verify`         | Lint, require 100% unit-test coverage, build, and check the package |

`pnpm build` and then `pnpm verify:package` checks the npm tarball without publishing.

## More documentation

- [TESTING.md](TESTING.md) for local and browser test setup
- [RELEASE.md](RELEASE.md) for tagged npm Trusted Publishing
- [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- [changelog.md](changelog.md) for release notes
