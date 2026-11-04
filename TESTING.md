# Testing TimeSpan

## Unit tests

Jest unit tests live in `test/` and run against TypeScript source:

```bash
npm test
```

## Distribution tests

`npm run test:dist` rebuilds the package and checks the published layout:

- Node CommonJS (`dist/index.js`)
- Node ESM (`dist/index.mjs`)
- TypeScript declarations (`dist/index.d.ts`)
- An `npm pack` install into a temporary consumer project

Browser UMD/ESM loading is covered separately below so those checks run in real browsers.

CommonJS cannot be loaded natively in a browser (`module.exports` / `require`). That is a Node distribution format, not a browser one.

## Browser integration tests

Playwright loads the production files from `dist/` in Chromium, Firefox, and WebKit.

```bash
npm ci
npx playwright install
```

On Ubuntu/Debian, also install browser system libraries:

```bash
npx playwright install --with-deps
```

Then:

```bash
npm run test:browser
npm run test:browser:headed
npm run test:browser:ui
```

Those commands rebuild `dist/` and start a local fixture server automatically. View the last HTML report with `npm run test:browser:report`.

See `tests/browser/README.md` for fixture details.

### Fedora / WebKit

Playwright does not officially support Fedora. Chromium and Firefox often run after `npx playwright install`. WebKit typically needs Ubuntu packages (`libicu`, JPEG, GStreamer) that `--with-deps` installs with `sudo` on Debian-based systems.

Do not drop WebKit from the project config. GitHub Actions runs all three engines on `ubuntu-latest`.

Optional local workaround using the official Playwright container (Docker must be installed and running):

```bash
npm run test:browser:docker
```

Docker is not required. Native `npm run test:browser` remains the default.

## Pull request CI

Pushes and pull requests targeting `main` or `release/**` run:

- Jest on Ubuntu and Windows (`test.yml`)
- Playwright UMD and ESM tests in Chromium, Firefox, and WebKit (`browser-tests.yml`)
- Coverage, size-limit, and bundle analysis workflows

Jest runs on Node.js LTS (`22.x` and `24.x`). Required GitHub status checks must use those job names (`test (ubuntu-latest, 24.x)`, and so on). A required check for a Node version the workflow no longer runs will sit on pending forever.

## Releases

Version tags (`v*`) run the same browser suite against the tagged commit, then publish with npm Trusted Publishing. See [RELEASE.md](RELEASE.md).
