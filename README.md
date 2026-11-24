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

| Command               | What it does                                                                   |
| --------------------- | ------------------------------------------------------------------------------ |
| `pnpm build`          | Build every package under `packages/` and `apps/`                              |
| `pnpm typecheck`      | Typecheck every package under `packages/`. The build does not do this          |
| `pnpm test`           | Test every package under `packages/`                                           |
| `pnpm bench`          | Run benchmarks for every package that defines them                             |
| `pnpm verify:package` | Pack each package and fail on every publish-gauge finding                      |
| `pnpm verify`         | Lint, typecheck, require 100% unit-test coverage, build, and check the package |

`build`, `typecheck`, `test`, `verify:package`, `size`, `bench`, and `sandbox` take an optional package name. `timespan` is `@undercroft/timespan`. `rtspan` is `@undercroft/react-timespan`. `docs` is `timespan-documentation`. Leaving the name off runs every package under `packages/` and `apps/`, the same as `all`. A package that does not define the script is skipped.

`pnpm test` runs unit tests. Add `--coverage` for coverage, `--ci` for the CI coverage report, `--dist` for the published-package checks, and `--browser` for the headless browser suite. `--browser --docker` runs that suite in the Playwright container. The suite serves packages that publish ESM and UMD files. `@undercroft/react-timespan` does not publish `./umd`, so `pnpm test --browser` skips it.

```bash
pnpm build
pnpm build timespan
pnpm test
pnpm test timespan --browser
pnpm test --ci --coverage --dist --browser
```

`pnpm build` and then `pnpm verify:package` checks the npm tarball without publishing.

## More documentation

- [TESTING.md](TESTING.md) for local and browser test setup
- [RELEASE.md](RELEASE.md) for tagged npm Trusted Publishing
- [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- [changelog.md](changelog.md) for release notes
