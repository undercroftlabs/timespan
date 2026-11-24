# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0] – Unreleased

Published ESM, CommonJS, and UMD files are readable JavaScript. Entry points, `window.Timespan`, declarations, and source maps stay in place.

### Changed

- The files on npm are the readable build. `import` loads `dist/index.mjs`, `require` loads `dist/index.js`, and browsers load `dist/index.umd.js` with the global `window.Timespan`. Declarations stay at `dist/index.d.mts` and `dist/index.d.ts`. Source maps stay beside the JavaScript files. The tarball has no separate `*.min.js` file.
- A direct download of those files is the larger readable build. An application bundler can still minify its own copy. The Size Limit budget remains 4 kB Brotli for that optimized output. The measured optimized sizes are 3.91 kB CommonJS, 3.83 kB ESM, and 3.94 kB UMD.
- Published file sizes for this build: ESM 63,766 bytes (13,066 gzip, 11,185 Brotli), CommonJS 63,890 bytes (13,130 gzip, 11,232 Brotli), and UMD 65,871 bytes (13,212 gzip, 11,343 Brotli). The packed tarball is 110,520 bytes. The unpacked package is 567,929 bytes.

### Documentation

- The README describes the readable builds, declarations, and source maps. It separates the optimized consumer bundle, the published file size, and the package size.
- The jsDelivr URL `dist/index.umd.min.js` is documented as a generated response for after publication. It is not a file in the npm package. unpkg serves the published file. esm.sh builds its own module; `?dev` is its development build and `?raw` is the original package bytes. esm.run is jsDelivr's ESM address, not esm.sh.
- The bundle size badge is the optimized ESM consumer bundle, 3.83 kB Brotli. The install size badge is the unpacked package, 554.6 kB (567,929 bytes). Neither badge follows the `latest` tag.

---

## [1.3.0] – 2026-11-15

Formatting, JSON, and more ways to build a timespan. Calendar breakdowns after a clamped month or year are corrected. Successful calculations for ordinary dates are unchanged. Several error messages are not.

### Added

- Instance and static `format`. A directive is `%[flags][width][.precision]specifier`. Flags are `0`, `-`, `+`, and a space. Uppercase specifiers are totals (`%Y`, `%B`, `%W`, `%D`, `%H`, `%M`, `%S`, `%L`). Lowercase specifiers are the `toTimeframe()` components. `%f` is fractional seconds from the millisecond component, 3 digits by default, truncated rather than rounded. `%%` is a literal percent. A width or precision of 1,000,000 or more is rejected. The format string itself has no length limit. An invalid format throws `Invalid format string: expected a valid format string.`
- JSON save and restore. `toJSON`, which `JSON.stringify` calls, returns `{ $type: 'Timespan', start, end }` with ISO strings. The `TimespanJson` type is exported. `fromJSON` rebuilds one timespan. `stringify` and `parse` do the same for a JSON string. `reviver` restores nested timespans passed to `JSON.parse`. `isTimespanJSON` checks that shape only: it does not parse the dates, a true result does not mean `fromJSON` will succeed, and a `Timespan` instance returns false.
- `fromObject(partial, start?)` builds a span from any subset of timeframe fields. Omitted and zero units are skipped. Years and months clamp the same way as `fromYears` and `fromMonths`. A non-object throws `Invalid timeframe: expected an object.`
- Instance and static `clone`. The copy has the same endpoints and does not share `Date` objects with the original.
- Instance and static `isZero`, true when the duration is zero milliseconds. `toString()` is then an empty string.

### Changed

- Validation errors name the problem. `Invalid date input.` is now `Invalid date: expected a valid Date.` A reversed range throws `Invalid date range: expected the start date to be less than or equal to the end date.` instead of `Start date cannot be greater than end date.` An unknown unit passed to `fromUnits` or `toUnit` throws `Invalid time unit: expected a recognized time unit.` instead of `Invalid date unit: <unit>.` `fromString` rejects disallowed characters with `Invalid input string: expected letters, digits, and whitespace only.` and strings longer than 75 characters with `Invalid input string: expected at most 75 characters.`
- The package `exports` map sends `import` to the ESM build, `require` to CommonJS, and `@undercroft/timespan/umd` to the browser build. `window.Timespan` is unchanged. Other package subpaths are not exported.
- Unit factories reject a non-finite amount, or a result outside the representable date range, with `Invalid number of <unit>: ...`. Fractions of fixed-length units, including days, are still accepted. Negative amounts still throw.

### Fixed

- `toTimeframe()` and `toString()` measure the remainder from the clamped month or year anniversary. Advancing the cursor with `setUTCFullYear` or `setUTCMonth` could roll 31 January or 29 February into the next month and leave a negative remainder.
- Month clamping uses the Gregorian length of the target month, including a 29-day February, including when that month sits at the edge of the representable date range.
- A month or year anniversary that falls outside the representable date range is not counted as elapsed.

### Documentation

- The README is organized by task. Each task has a short example plus a CodePen playground and preview.
- The bundle size badge is the 1.3.0 ESM build, minified and Brotli-compressed. The install size badge is the unpacked package size. Neither badge follows the `latest` tag.

---

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
