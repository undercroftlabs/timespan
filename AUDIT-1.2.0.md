# Audit for 1.2.0

Branch `audit/1.2.0-prep` is based on `release/1.2.0` (`084a69e`). That release branch was not moved. `main` is still `41a4877`. No dependencies were added. `package.json` has no `dependencies` field, and the version is still `1.1.0`.

Nothing here was merged, tagged, or pushed. Issues #30–#43 were not implemented. Toolchain packages were not upgraded.

## Baseline test result

Recorded on a clean `release/1.2.0` before any audit commit, Node v26.13.0:

```
npm test
@undercroft/timespan@1.1.0
Test Suites: 10 passed, 10 total
Tests:       131 passed, 131 total
```

An earlier run on `main` (`41a4877`), before this branch was retargeted, was 117 passed. The extra 14 tests are the equals and compareTo coverage that exists only on `release/1.2.0`.

After the fixes below, `npm test` is 137 passed, 10 suites. The pre-commit hook's `npm run test:cov` stayed at 100% statements, branches, functions, and lines.

## Findings

### Verified and fixed

**1. Stateful `InputRegexPattern`.** Verified. `src/constants.ts` exports `/(\d{0,10})([^\s\d]+)/g`. `Timespan.fromString` called `.exec()` on that shared object. A throw inside the loop left `lastIndex` advanced. Reproduction: `fromString('1h')` succeeded, `fromString('1h 2x')` threw `Invalid date unit: x.`, and the same `fromString('1h')` then threw `Invalid unit`.

Three existing assertions were passing only because of that leak, in file order:

| Input | Error while `lastIndex` leaked | Error for that input alone |
| --- | --- | --- |
| `5 unknownUnit` | `Invalid unit` | `Invalid date unit: unknownUnit.` |
| `Hello\tWorld` | `Invalid date unit: World` | `Invalid date unit: Hello` |
| `Hello\nWorld` | `Invalid unit` | `Invalid date unit: Hello` |

`fromString` now compiles a fresh `RegExp` from the shared pattern on every call, so `lastIndex` cannot cross calls. The constant is still global; nothing else in `src/` calls `.exec()` on it. A new test parses `1h`, then a throwing string, then `1h` again. Another test parses `5`, which genuinely matches no unit and still throws `Invalid unit`, so that branch stays covered.

**2. Package metadata.** Verified. `description` was `""`. `homepage`, `repository.url`, and `bugs.url` pointed at `mikejg101/timespan`. They now describe the package and point at `undercroftlabs/timespan`. The repository URL keeps the existing `git@github.com:` form.

Still pointing at `mikejg101` and left unchanged: README badges, `rollup.config.cjs` `bundleName`, and `sonar-project.properties` on this branch (`sonar.projectKey=mikejg101_timespan`). `FUNDING.yml` and the contact emails name the maintainer, not the git remote.

**3. Immutability leaks.** Verified. The constructor stored the caller's `Date` objects, `start` and `end` returned those objects, and `toTimeframe()` returned the internal timeframe. Mutating any of them changed the instance. The constructor now stores copies, the getters return copies, and `toTimeframe()` returns a shallow copy. Tests mutate the input dates, the getter results, and the returned timeframe, and the span's instants, component values, and `toString()` stay put. `equals` on this branch compares `getTime()` and millisecond duration, so the copies do not change that result.

### Verified, not changed (needs a decision)

**4. Month-end overflow.** Verified in `MonthConverter.add`. It calls `setUTCMonth`, which rolls the day into the following month when the target month is shorter. UTC results from this branch:

| Call | Result |
| --- | --- |
| 2023-01-31 15:45:30.250Z + 1 month | 2023-03-03 15:45:30.250Z |
| 2024-01-31 + 1 month (leap year) | 2024-03-02 |
| 2023-01-30 + 1 month | 2023-03-02 |
| 2023-03-31 + 1 month | 2023-05-01 |
| 2023-05-31 + 1 month | 2023-07-01 |
| 2023-01-31 + 2 months | 2023-03-31 |

Adding two months lands on 31 March because `setUTCMonth` jumps to March, which has 31 days. It does not walk through February.

`YearConverter.add` already clamps the leap-day case. 2020-02-29 08:09:10.011Z + 1 year is 2021-02-28 at the same time of day. The same instant + 4 years is 2024-02-29. The existing test `should handle February 29th when adding years to a date` covers the non-leap clamp. No year-converter change is proposed.

`fromString` does not use those converters. It calls `setUTCFullYear` and `setUTCMonth` itself:

- `fromString('1M')` from 2023-01-31T12:00:00.000Z ends 2023-03-03T12:00:00.000Z.
- `fromString('1y')` from 2020-02-29T12:00:00.000Z ends 2021-03-01T12:00:00.000Z.

So a month clamp inside `MonthConverter.add` would change `fromMonths` and leave `fromString('1M')` overflowing. The year clamp already in `YearConverter.add` does not apply to `fromString('1y')`.

Proposed change, not applied: in `MonthConverter.add`, move to day 1, add the months, then set the day to `min(original day, last day of the target month)`, keeping the current UTC time save and restore. Under that rule, 31 January plus one month becomes 28 February (29 in a leap year), and 31 January plus two months stays 31 March. The matching `fromString` change is to add months and years through `MonthConverter` and `YearConverter` instead of the raw setters. Both are behavior changes.

**5. Repeated units and fractions in `fromString`.** Verified, left as they are.

Repeated units overwrite. The parser assigns `timeframe[plural] = value` on every match, so the last value for that unit wins and other units are kept:

| Input | `toString()` |
| --- | --- |
| `1h 2h` | `2h` |
| `2h 1h` | `1h` |
| `1h 30m 2h` | `2h 30m` |

Fractions never reach the number parser. `.` is outside `AllowedCharactersRegexPattern` (`/^[a-zA-Z0-9\s]+$/`), so `1.5h` and `1.5 hours` throw `Invalid input string`.

Summing repeated units, or accepting fractional values, would be a behavior change.

### Suspected, then checked

**Release branch contents.** The branch is not only the equals and compareTo work. `main...release/1.2.0` is ahead by 6 and behind by 0:

| Commit | What it is |
| --- | --- |
| `06fd225` | `build: updated sonar analysis` (adds a Sonar workflow and `sonar-project.properties`) |
| `8c2f574` | `build: update build scripts to standardize on actions` |
| `1c886a4` | `build: removed broken sonar cube action` (deletes the workflow, leaves the properties file) |
| `5fed83c` | equals instance method, PR #46 |
| `4edfaef` | static `equals`, PR #47 |
| `084a69e` | static and instance `compareTo`, PR #48 |

Net build diff against `main`: `bundle-analysis.yml`, `size-limit.yml`, and `publish.yml` move those jobs toward `actions/checkout@v3`, Node `lts/*`, and `npm ci`. The publish job in `publish.yml` still checks out with `actions/checkout@v2`. `sonar-project.properties` is new and still names `mikejg101`. `test.yml` is unchanged and still uses Node `23.x`, `actions/checkout@v2`, `actions/setup-node@v1`, and `npm install`.

PR #45 is recorded as merged to `main` (squash `2bf405ba`, parent `41a4877`). `origin/main` is still `41a4877`, and that squash is on neither `main` nor `release/1.2.0`. The equals implementation that is actually in git is PR #46. Do not merge #45 again.

`package.json` `version` on `release/1.2.0` and on this branch is `1.1.0`.

**Issues #30–#43.** Checked against `main` and `release/1.2.0`. `src/timespan.ts` on the release branch adds `equals` and `compareTo` only. There is no `format`, instance `add`/`subtract`, `clone`, `isZero`, `fromObject`, component `addDays`/`subtractHours` (and the rest of that set), `max`, `min`, `toJSON`, `abs`, or `negate`. Converter `add(amount, date)` is the internal date helper, not issue #31.

| Issue | Request | Result |
| --- | --- | --- |
| #30 | Format tokens | Not implemented |
| #31 | `add()` another timespan | Not implemented |
| #32 | `subtract()` | Not implemented |
| #33 | `compareTo()` returns -1, 0, 1 | Implemented only on `release/1.2.0` (and therefore on this branch). Closed on GitHub. Also has a static wrapper. |
| #34 | `equals()` by duration | Implemented only on `release/1.2.0`. Closed on GitHub. Default comparison is duration. An extra `compareBy: 'range'` mode is also present. |
| #35 | `clone()` | Not implemented |
| #36 | `isZero()` | Not implemented |
| #37 | `fromObject()` | Not implemented |
| #38 | Chainable component add/subtract | Not implemented |
| #39 | `max()` and `min()` | Not implemented |
| #40 | JSON serialization | Not implemented |
| #41 | `abs()` | Not implemented |
| #42 | `negate()` | Not implemented |
| #43 | Negative timespans | Not implemented |

The code that exists for 1.2.0 is equals, compareTo, and the three fixes in this audit. Issues #30–#32 and #35–#43 are still open and absent from both branches.

**Toolchain, report only.** No upgrades in this pass. Installed versions:

| Tool | Installed | Config |
| --- | --- | --- |
| ESLint | 7.32.0 | `.eslintrc.js` (legacy eslintrc) |
| `@typescript-eslint` parser and plugin | 4.33.0 | same file |
| `eslint-plugin-sonarjs` | 0.19.0 | `plugin:sonarjs/recommended` |
| `eslint-plugin-jsdoc` | 44.2.7 | `plugin:jsdoc/recommended-typescript-error` |
| Prettier | 2.8.8 | `.prettierrc.js` |
| TypeScript | 4.9.5 | `tsconfig.json` and `tools/tsconfig.json`: target ES5, `module`/`moduleResolution` CommonJS and `node`, `lib` up through ES2017 |
| Jest | 27.5.1 | `jest.config.js`, CommonJS |
| ts-jest | 27.1.5 | `globals['ts-jest']` |
| `@types/jest` | 27.5.2 | |
| tsup | 8.4.0 | `npm run build` ESM and CJS |
| Rollup | 4.40.0 | `rollup.config.cjs` UMD |
| Husky | 7.0.4 | `postinstall`: `husky install` |
| commitlint | config-conventional | `commitlint.config.js`, body lines max 100 |

A later modernization would be its own change:

- ESLint 9 uses flat `eslint.config.js` and drops eslintrc by default. That means a new config, `@typescript-eslint` 8, a current SonarJS plugin, and a Prettier 3 / `eslint-plugin-prettier` 5 pair. `eslint-plugin-jsdoc` 44 is already ahead of ESLint 7. `eslint-plugin-no-underscore` needs a replacement check.
- TypeScript 5 can stay `strict`. Moving `moduleResolution` from `node` to `node16` or `bundler` can break the `ts-node` tools, which import extensionless paths. tsup already emits the published ESM and CJS; the ES5 `tsconfig` target is not the publish pipeline by itself.
- Jest 29 or 30 replaces the `globals` ts-jest block with a transform config. Jest 27 is what enforces the 100% coverage gate today. `toThrowError` in the tests is the older alias of `toThrow`.
- `test.yml` still pins Node `23.x`. The release-branch workflow edits use `lts/*` for other jobs only. There is no `engines` field. Husky 9 replaces `husky install` in `postinstall`.

## Fixes applied

All three commits are on `audit/1.2.0-prep`, on top of `084a69e`:

| Commit | Subject |
| --- | --- |
| `6cb96c5` | `fix: isolate fromString regex state between calls` |
| `d749415` | `chore: set description and undercroftlabs repository urls` |
| `e913058` | `fix: copy dates and timeframes out of Timespan` |

`npm test` after each of those commits: 133, 133, then 137 passed.

## 1.2.0 readiness checklist

- [x] Baseline on `release/1.2.0`: 131 passed.
- [x] Suite green after each fix. Final count 137 passed, coverage 100%.
- [x] No runtime dependencies added.
- [x] `fromString` no longer shares regex `lastIndex` across calls.
- [x] `description`, `homepage`, `repository`, and `bugs` point at `@undercroft/timespan` / `undercroftlabs/timespan`.
- [x] Dates and timeframes are copied at the public boundary.
- [ ] Decide the month-end clamp, and whether `fromString` should use the converters so `1M` and `1y` follow the same rule. Not changed.
- [ ] Decide whether repeated units should sum, and whether fractional input should parse. Not changed.
- [ ] Decide whether the three build commits stay in 1.2.0. They are already in this branch because it is based on `release/1.2.0`. `sonar-project.properties` still says `mikejg101`.
- [ ] Leave #30–#32 and #35–#43 out of 1.2.0. equals (#34) and compareTo (#33) are the feature scope already on the release branch.
- [ ] Bump `package.json` `version` from `1.1.0` to `1.2.0` on the release commit only.
- [ ] Write the `## [1.2.0]` section of `changelog.md` by hand, in the current style. Do not run `npm run changelog`. That command rewrites `changelog.md` and skips commit subjects that end in `(#n)`, which drops #46, #47, and #48.
- [ ] Tag `v1.2.0` on that commit. `publish.yml` runs on tags matching `v*`.
- [ ] Open the PR from `audit/1.2.0-prep` to `main`. Open PR #44 is `release/1.2.0` into `main` and does not contain these audit commits. Merging #44 alone ships equals, compareTo, and the build commits without the fixes above.
- [ ] Optional follow-up, not required for the behavior fixes: README badges and the Rollup Codecov `bundleName` still say `mikejg101/timespan`.
