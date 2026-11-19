# Browser distribution tests

These Playwright tests load the **built** TimeSpan files from `dist/`, not TypeScript source.

| Format | File                | How it is loaded                                 |
| ------ | ------------------- | ------------------------------------------------ |
| UMD    | `dist/index.umd.js` | Classic `<script>` tag; global `window.Timespan` |
| ESM    | `dist/index.mjs`    | Native `import` in a module script               |

CommonJS (`dist/index.js`) is a Node distribution. Browsers cannot load it with a script tag or a native ES module import. `pnpm test --dist` builds the selected packages, checks each tarball, then loads `@undercroft/timespan` with `require` and `import` in `load-bundles.test.mjs`.

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
pnpm test --browser
pnpm test timespan --browser
```

That command builds each selected package that publishes `./umd` and serves its `dist/` headlessly. `@undercroft/react-timespan` has no `./umd` export, so the suite skips it. Results print in the terminal. The HTML report stays in `playwright-report/`.

On Fedora, WebKit may fail to launch natively. Keep the WebKit project enabled so CI still covers Safari. Prefer the official Playwright image instead of installing Ubuntu browser packages:

```bash
sudo dnf install podman
pnpm test --browser --docker
```

That command auto-selects Podman on Linux, or Docker if Podman is absent. Pin the engine with `CONTAINER_ENGINE=podman` or `CONTAINER_ENGINE=docker`.

The container installs dependencies and builds the selected packages inside an isolated workspace. Host `node_modules` is not overwritten. The HTML report is copied to `playwright-report/`. The first pull caches the lockfile-matched image locally.
