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

On Fedora, WebKit may fail to launch natively. Keep the WebKit project enabled so CI still covers Safari. Prefer the official Playwright image instead of installing Ubuntu browser packages:

```bash
sudo dnf install podman
npm run test:browser:docker
```

That command auto-selects Podman on Linux, or Docker if Podman is absent. Pin the engine with `CONTAINER_ENGINE=podman` or `CONTAINER_ENGINE=docker`. `npm run test:browser:container` is the same runner.

The container installs dependencies and builds `dist/` inside an isolated workspace. Host `node_modules` is not overwritten. After the run, open `playwright-report/` or `npm run test:browser:report`. The first pull caches the lockfile-matched image locally.
