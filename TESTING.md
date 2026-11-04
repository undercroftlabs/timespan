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

On Linux, also install the browser system libraries (Ubuntu/Debian):

```bash
npx playwright install --with-deps
```

Playwright's `--with-deps` installer targets Ubuntu packages. On Fedora/RHEL, install browsers with `npx playwright install` and provide equivalent system libraries yourself, or rely on GitHub Actions (`ubuntu-latest`) for WebKit. Chromium and Firefox often run without extra packages; WebKit typically needs additional ICU, JPEG, and GStreamer libraries.

Run the suite (rebuilds `dist/` and starts a local fixture server):

```bash
npm run test:browser
```

Debugging:

```bash
npm run test:browser:headed
npm run test:browser:ui
npm run test:browser:report
```

See `tests/browser/README.md` for fixture details.
