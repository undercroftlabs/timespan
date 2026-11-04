# Browser distribution tests

These Playwright tests load the **built** TimeSpan files from `dist/`, not TypeScript source.

| Format | File                | How it is loaded                                 |
| ------ | ------------------- | ------------------------------------------------ |
| UMD    | `dist/index.umd.js` | Classic `<script>` tag; global `window.Timespan` |
| ESM    | `dist/index.mjs`    | Native `import` in a module script               |

CommonJS (`dist/index.js`) is a Node distribution. Browsers cannot load it with a script tag or a native ES module import. Node coverage for CJS (and packed-package layout) lives in `npm run test:dist`.

## Local setup

```bash
npm ci
npx playwright install
```

On Linux, install browser OS dependencies as well:

```bash
npx playwright install --with-deps
```

Then:

```bash
npm run test:browser
```

That command rebuilds `dist/` and starts the local fixture server automatically. Headed and UI modes:

```bash
npm run test:browser:headed
npm run test:browser:ui
npm run test:browser:report
```

On Fedora, WebKit may fail to launch. Keep the WebKit project enabled so Ubuntu CI still covers Safari. Optionally run the full three-browser suite in Docker:

```bash
npm run test:browser:docker
```
