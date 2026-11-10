# Testing TimeSpan

## Unit tests

Jest unit tests live in `test/` and run against TypeScript source:

```bash
npm test
```

## Distribution tests

`npm run test:dist` rebuilds the package, then checks the published tarball:

- `publint` checks the package entry points
- `attw` checks TypeScript resolution of the root export
- A Node test loads `dist/index.js` and `dist/index.mjs` and runs one timespan

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

Do not drop WebKit from the project config. GitHub Actions runs Chromium, Firefox, and WebKit in the official Playwright image (`mcr.microsoft.com/playwright:v<lockfile-version>-noble`). The image already includes the browsers and OS libraries, so CI does not run `npx playwright install --with-deps`. GitHub-hosted runners may still pull that image on each job.

The image tag is derived from `package-lock.json` (`node tools/playwright-image.cjs`), not `latest`.

### Containerized local run (Podman or Docker)

On Fedora, install Podman and run the same official image. That avoids installing Ubuntu WebKit packages on the host:

```bash
sudo dnf install podman
npm run test:browser:docker
```

The script prefers Podman on Linux when both engines are installed. Override with `CONTAINER_ENGINE`:

```bash
CONTAINER_ENGINE=podman npm run test:browser:docker
CONTAINER_ENGINE=docker npm run test:browser:docker
```

`npm run test:browser:container` is an alias for the same command. The container copies the repo into a writable workspace, runs `npm ci` and `npm run build` there (host `node_modules` is not mounted), then runs Chromium, Firefox, and WebKit. HTML output lands in `playwright-report/` (`npm run test:browser:report`). Local engines cache the image after the first pull; CI does not.

If a bind mount fails with a SELinux denial on Fedora, the runner already adds `:Z` for Podman. Do not run the container as privileged or with `sudo`. If reports are missing, check that `playwright-report/` and `test-results/` are writable by your user.

Native `npm run test:browser` remains the default for Chromium/Firefox on Fedora. Docker/Podman is optional.

To compare CI time before and after the container change, open the Browser Tests workflow run and compare total job duration plus the old “Install Playwright browsers” step against the new job (image pull + `npm ci` + `npm run test:browser`). Do not assume the image is cached between runs.

## Pull request CI

Pushes and pull requests targeting `main` or `release/**` run:

- Jest on Ubuntu and Windows (`test.yml`)
- Playwright UMD and ESM tests in Chromium, Firefox, and WebKit (`browser-tests.yml`)
- Coverage, size-limit, and bundle analysis workflows

Supported Node versions come from `engines.node` in `package.json` (even-numbered, non-EOL LTS). CI expands that range into the Test matrix. Single-job workflows (Playwright, size-limit, publish) use the newest major in that list.

To add or drop a Node line:

1. Edit `engines.node` (for example add `^28.0.0` when 28 is Active LTS, or drop `^22.0.0` at EOL).
2. Run `npm test` locally on the newest listed LTS.
3. Push. GitHub Actions reads `engines` and tests every remaining even major.

The required GitHub check is the aggregate job named `test`, not each matrix cell, so bumping `engines` does not leave stale `23.x` checks pending. Dropping the minimum supported major is a breaking change.

## Releases

Version tags (`v*`) run the same browser suite against the tagged commit, then publish with npm Trusted Publishing. See [RELEASE.md](RELEASE.md).
