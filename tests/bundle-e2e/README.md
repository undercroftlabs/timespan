# Browser distribution tests

These Playwright tests load the **built** TimeSpan files from `dist/`, not TypeScript source.

| Format | File                | How it is loaded                                 |
| ------ | ------------------- | ------------------------------------------------ |
| UMD    | `dist/index.umd.js` | Classic `<script>` tag; global `window.Timespan` |
| ESM    | `dist/index.mjs`    | Native `import` in a module script               |

CommonJS (`dist/index.js`) is a Node distribution. Browsers cannot load it with a script tag or a native ES module import. This workspace loads it with `require('@undercroft/timespan')` in `bundles.spec.ts` and `load-bundles.test.mjs`. `pnpm run test:dist` builds the library, checks the tarball, then runs that Node load test.

## Local setup

```bash
pnpm install --frozen-lockfile
pnpm --filter @undercroft/timespan-bundle-e2e exec playwright install
```

On Linux, install browser OS dependencies as well:

```bash
pnpm --filter @undercroft/timespan-bundle-e2e exec playwright install --with-deps
```

Then:

```bash
pnpm run test:browser
```

That command rebuilds `dist/` and starts the local fixture server automatically. Headed and UI modes:

```bash
pnpm run test:browser:headed
pnpm run test:browser:ui
pnpm run test:browser:report
```

On Fedora, WebKit may fail to launch natively. Keep the WebKit project enabled so CI still covers Safari. Prefer the official Playwright image instead of installing Ubuntu browser packages:

```bash
sudo dnf install podman
pnpm run test:browser:docker
```

That command auto-selects Podman on Linux, or Docker if Podman is absent. Pin the engine with `CONTAINER_ENGINE=podman` or `CONTAINER_ENGINE=docker`. `pnpm run test:browser:container` is the same runner.

The container installs dependencies and builds `dist/` inside an isolated workspace. Host `node_modules` is not overwritten. After the run, open `playwright-report/` or `pnpm run test:browser:report`. The first pull caches the lockfile-matched image locally.
