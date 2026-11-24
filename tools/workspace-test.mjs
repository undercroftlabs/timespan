import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runPnpm } from './run-pnpm.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

const packages = {
  timespan: '@undercroft/timespan',
  rtspan: '@undercroft/react-timespan',
};

const directories = {
  timespan: path.join(repoRoot, 'packages/timespan'),
  rtspan: path.join(repoRoot, 'packages/react-timespan'),
};

const flags = new Set([
  '--ci',
  '--coverage',
  '--dist',
  '--browser',
  '--docker',
]);

const parsed = parseArgs(process.argv.slice(2));
if (!parsed) {
  process.exit(1);
}

let status = runUnitTests(parsed.target, parsed.ci, parsed.coverage);
if (status !== 0) {
  process.exit(status);
}

if (parsed.dist) {
  status = runPackageScript(parsed.target, 'test:dist');
  if (status !== 0) {
    process.exit(status);
  }
}

if (parsed.browser) {
  status = parsed.docker
    ? runBrowserInDocker(parsed.target)
    : runBrowser(parsed.target);
}

process.exit(status);

/**
 * @param {string[]} argv - Arguments after the script name.
 * @returns {{ target: string, ci: boolean, coverage: boolean, dist: boolean, browser: boolean, docker: boolean } | null} Parsed options, or null when the arguments are invalid.
 */
function parseArgs(argv) {
  let target = 'all';
  const selected = new Set();

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    if (flags.has(arg)) {
      selected.add(arg);
      continue;
    }
    if (arg === 'all' || Object.hasOwn(packages, arg)) {
      target = arg;
      continue;
    }
    process.stderr.write(`Unknown test argument "${arg}".\n`);
    printHelp();
    return null;
  }

  if (selected.has('--docker') && !selected.has('--browser')) {
    process.stderr.write(
      '--docker runs the browser tests. Pass --browser as well.\n',
    );
    return null;
  }

  return {
    target,
    ci: selected.has('--ci'),
    coverage: selected.has('--coverage'),
    dist: selected.has('--dist'),
    browser: selected.has('--browser'),
    docker: selected.has('--docker'),
  };
}

/**
 * Run Vitest for the selected packages.
 * `--ci` uses each package's `test:ci` script. `--coverage` uses `test:cov`.
 * @param {string} target - `timespan`, `rtspan`, or `all`.
 * @param {boolean} ci - Whether to use the CI reporter script.
 * @param {boolean} coverage - Whether to collect coverage.
 * @returns {number} Exit status.
 */
function runUnitTests(target, ci, coverage) {
  const script = ci ? 'test:ci' : coverage ? 'test:cov' : 'test';
  return runPackageScript(target, script);
}

/**
 * React tests import the published `@undercroft/timespan` entry, which is `dist`.
 * Build that package before those tests so a clean checkout can resolve it.
 * @param {string} name - Short package name about to be tested.
 * @param {string} script - Package script name.
 * @returns {number} Exit status. `0` when no build is required.
 */
function buildTimespanBeforeReactTests(name, script) {
  if (name !== 'rtspan' || !script.startsWith('test')) {
    return 0;
  }
  if (script.startsWith('test:dist')) {
    return 0;
  }

  const built = runPnpm(['--filter', packages.timespan, 'run', 'build'], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (built.error) {
    process.stderr.write(`${built.error.message}\n`);
    return 1;
  }
  return built.status ?? 1;
}

/**
 * @param {string} target - `timespan`, `rtspan`, or `all`.
 * @param {string} script - Package script name.
 * @returns {number} Exit status. Packages that do not define the script are skipped.
 */
function runPackageScript(target, script) {
  const selected = target === 'all' ? Object.keys(directories) : [target];
  let status = 0;

  for (const name of selected) {
    const directory = directories[name];
    const manifest = JSON.parse(
      readFileSync(path.join(directory, 'package.json'), 'utf8'),
    );
    const command = manifest.scripts?.[script];
    if (typeof command !== 'string') {
      continue;
    }

    const prepared = buildTimespanBeforeReactTests(name, script);
    if (prepared !== 0) {
      return prepared;
    }

    const result = runPnpm(['--filter', packages[name], 'run', script], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    if (result.error) {
      process.stderr.write(`${result.error.message}\n`);
      return 1;
    }
    status = result.status ?? 1;
    if (status !== 0) {
      return status;
    }
  }

  return status;
}

/**
 * The browser suite loads the published ESM and UMD files.
 * @param {string} name - Short package name.
 * @returns {boolean} Whether that package exports `./umd`.
 */
function publishesBrowserDistribution(name) {
  const manifest = JSON.parse(
    readFileSync(path.join(directories[name], 'package.json'), 'utf8'),
  );
  return Boolean(manifest.exports?.['./umd']);
}

/**
 * @param {string} target - `timespan`, `rtspan`, or `all`.
 * @returns {string[]} Short names whose packages publish a browser distribution.
 */
function browserTargets(target) {
  const selected = target === 'all' ? Object.keys(directories) : [target];
  const runnable = [];
  for (const name of selected) {
    if (publishesBrowserDistribution(name)) {
      runnable.push(name);
      continue;
    }
    process.stdout.write(
      `${packages[name]} has no ./umd export, so the browser distribution suite skips it.\n`,
    );
  }
  return runnable;
}

/**
 * Build each selected package and run the headless browser suite against it.
 * @param {string} target - `timespan`, `rtspan`, or `all`.
 * @returns {number} Exit status.
 */
function runBrowser(target) {
  for (const name of browserTargets(target)) {
    const built = runPnpm(['--filter', packages[name], 'run', 'build'], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    if (built.error) {
      process.stderr.write(`${built.error.message}\n`);
      return 1;
    }
    if ((built.status ?? 1) !== 0) {
      return built.status ?? 1;
    }

    const tested = runPnpm(
      ['--filter', '@undercroft/timespan-bundle-e2e', 'run', 'test:playwright'],
      {
        cwd: repoRoot,
        stdio: 'inherit',
        env: {
          ...process.env,
          TIMESPAN_PACKAGE_DIR: directories[name],
        },
      },
    );
    if (tested.error) {
      process.stderr.write(`${tested.error.message}\n`);
      return 1;
    }
    if ((tested.status ?? 1) !== 0) {
      return tested.status ?? 1;
    }
  }
  return 0;
}

/**
 * Run the headless browser suite for the selected packages in the Playwright container.
 * @param {string} target - `timespan`, `rtspan`, or `all`.
 * @returns {number} Exit status.
 */
function runBrowserInDocker(target) {
  const selected = browserTargets(target);
  if (selected.length === 0) {
    return 0;
  }
  const result = spawnSync('bash', ['tests/bundle-e2e/run-in-docker.sh'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      TIMESPAN_TEST_TARGETS: selected.join(' '),
    },
  });
  if (result.error) {
    process.stderr.write(`${result.error.message}\n`);
    return 1;
  }
  return result.status ?? 1;
}

/**
 * Print the root test command.
 */
function printHelp() {
  process.stderr.write(
    'pnpm test [timespan|rtspan|all] [--ci] [--coverage] [--dist] [--browser] [--docker]\n',
  );
}
