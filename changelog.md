# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] – 2026-11-04

Correctness release: comparison APIs plus parser and calendar fixes. No new duration units or string formats.

### Added

- Instance and static `equals`, comparing either total duration (default) or start/end range.
- Instance and static `compareTo`, ordering timespans by duration.

### Changed

- Package metadata (`homepage`, `repository`, `bugs`) now points at `undercroftlabs/timespan`.
- Dev toolchain: TypeScript 6, Jest 30, ESLint 10, husky 9, and matching plugin updates.
- JS bundle size limits raised from 3.5 KB to 4 KB (brotli).

### Fixed

- `fromString` no longer shares regex `lastIndex` across calls after a throw.
- `start`, `end`, and `toTimeframe()` return copies so callers cannot mutate stored state.
- Malformed strings that used to parse as a silent zero (11-digit values, bare units) now throw.
- Repeated units in `fromString` throw `Duplicate date unit` instead of keeping the last value.
- Fractional values in `fromString` remain rejected; use unit factories such as `fromHours` for fractions of fixed-length units.
- Year and month counting use elapsed anniversary (including time of day for months), not calendar subtraction.
- Month and year addition clamp at period end, and `fromString` uses the same converters as `fromMonths` / `fromYears`.

---

## [1.1.0] – 2025-04-13

**⚠ BREAKING CHANGE:**  
Internal modules have been fully restructured. If you're importing from internal paths, update your imports to use the main public interface. Direct deep imports are no longer supported.

### Added

- **UMD Web Build**: The library can now be used directly in the browser via a CDN like jsDelivr. A `window.Timespan` global is now available for browser usage.
- **Static Web Test Page**: Added `web-test.html` to validate UMD builds and expose all public methods.
- **Size Monitoring**: Size tracking with [Size Limit](https://github.com/ai/size-limit) is now integrated into CI for bundle size awareness.
- **Code Coverage Reporting**: Integration with Codecov for unit test coverage tracking.
- **Jest JUnit Reporting**: Support added for CI-friendly test result outputs in `reports/junit.xml`.

### Changed

- `Timespan.toString(startDate)` now accepts an optional base date to anchor formatting.
- The internal unit conversion system was fully modularized:
  - Constants, formatting, and calculations now live in separate utility files.
  - Assertion functions and type guards improve runtime validation.
- Build system now uses Rollup for UMD and tsup for ESM/CJS builds.
- Node.js version requirements updated in CI to test against latest versions.
- `npm run clean` and build scripts improved for cross-platform compatibility.

### Removed

- Legacy utility and calculation files.
- Typedoc generation (temporarily) due to CI inconsistencies.

### Fixed

- Resolved a bug that caused incorrect `day` calculations in some scenarios.
- Timezone-related parsing issues fixed.
- Fixed issues with dependency audits targeting dev-only modules.

---

## [1.0.5] – April 11, 2025

- Public interface simplified: consumers now only import from the root module.
- Moved internal constants out of `Timespan` and into dedicated files.
- `Timespan.fromString()` now accepts an optional start date for relative parsing.
- Line-ending formatting issues resolved across platforms.

## [1.0.4] – May 27, 2023

- Bugfix: incorrect duration calculations involving days and timezones.
- Internal structure improvements and additional unit tests.
- Added standard community documents (e.g., Code of Conduct, license metadata).
- Migrated all internal tooling to TypeScript.

## [1.0.3] – May 27, 2023

- Feature: improved accuracy for duration breakdown and parsing logic.

## [1.0.2] – May 27, 2023

- Documentation: updated usage examples in README to reflect current API.

## [1.0.1] – May 27, 2023

- Docs: added project badges and refined installation instructions.

## [1.0.0] – May 27, 2023

- Initial release of the `Timespan` utility.
- Included CLI tools, parsing, formatting, and duration breakdown support.
