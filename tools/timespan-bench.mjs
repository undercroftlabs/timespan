import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const packageDir = path.join(repoRoot, 'packages/timespan');
const recordsRoot = path.join(repoRoot, 'benchmarks/timespan');
const packageJson = JSON.parse(
  readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
);

/**
 * Use an explicit release version, or the library package version.
 * @param {string | undefined} version - Optional `major.minor.patch` argument.
 * @returns {string} Version directory name.
 */
function resolveVersion(version) {
  if (!version) {
    return packageJson.version;
  }

  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Version must look like 1.2.1. Received "${version}".`);
  }

  return version;
}

/**
 * @param {string} version - Release directory name.
 * @returns {string} Absolute path to that release directory.
 */
function recordDirectory(version) {
  return path.join(recordsRoot, version);
}

/**
 * @param {string[]} args - Arguments passed to git.
 * @returns {string | null} Trimmed stdout, or null when git fails.
 */
function git(args) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return null;
  }

  return result.stdout.trim();
}

/**
 * @param {string[]} args - Arguments after `vitest bench --run`.
 * @returns {void}
 */
function runVitest(args) {
  const result = spawnSync(
    'pnpm',
    [
      '--filter',
      '@undercroft/timespan',
      'exec',
      'vitest',
      'bench',
      '--run',
      ...args,
    ],
    { cwd: repoRoot, stdio: 'inherit' },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

/**
 * @param {string} version - Release directory name.
 * @returns {void}
 */
function save(version) {
  const directory = recordDirectory(version);
  const resultsFile = path.join(directory, 'results.json');

  mkdirSync(directory, { recursive: true });
  runVitest(['--outputJson', resultsFile]);

  const report = JSON.parse(readFileSync(resultsFile, 'utf8'));
  if (!Array.isArray(report.files)) {
    throw new Error(`Vitest wrote an unexpected report to ${resultsFile}.`);
  }

  for (const file of report.files) {
    if (
      typeof file.filepath === 'string' &&
      file.filepath.startsWith(`${repoRoot}${path.sep}`)
    ) {
      file.filepath = path.relative(repoRoot, file.filepath);
    }
  }

  writeFileSync(resultsFile, `${JSON.stringify(report, null, 2)}\n`);

  const cpu = os.cpus()[0];
  const vitestPackage = JSON.parse(
    readFileSync(
      path.join(packageDir, 'node_modules/vitest/package.json'),
      'utf8',
    ),
  );
  const environment = {
    library: packageJson.name,
    packageVersion: packageJson.version,
    recordVersion: version,
    recordedAt: new Date().toISOString(),
    gitCommit: git(['rev-parse', 'HEAD']),
    gitDirty: Boolean(git(['status', '--porcelain'])),
    node: process.version,
    vitest: vitestPackage.version,
    cpu: cpu
      ? {
          model: cpu.model,
          cores: os.cpus().length,
        }
      : null,
    os: {
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
    },
    target: 'typescript-source',
  };

  writeFileSync(
    path.join(directory, 'environment.json'),
    `${JSON.stringify(environment, null, 2)}\n`,
  );
}

/**
 * @param {string} version - Release directory name.
 * @returns {void}
 */
function compare(version) {
  const resultsFile = path.join(recordDirectory(version), 'results.json');

  if (!existsSync(resultsFile)) {
    throw new Error(`No benchmark record at ${resultsFile}.`);
  }

  runVitest(['--compare', resultsFile]);
}

const [command, versionArg] = process.argv.slice(2);
const version = resolveVersion(versionArg);

if (command === 'save') {
  save(version);
} else if (command === 'compare') {
  compare(version);
} else {
  process.stderr.write(
    'Usage: node tools/timespan-bench.mjs <save|compare> [version]\n',
  );
  process.exit(1);
}
