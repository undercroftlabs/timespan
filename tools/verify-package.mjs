import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const packageDir = process.cwd();
const sourceManifest = JSON.parse(
  readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
);
const gaugeConfig = path.join(packageDir, '.publish-gauge.json');
const gaugeBin = path.join(packageDir, 'node_modules', '.bin', 'publish-gauge');
const reportDir = path.join(packageDir, 'reports');
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  ...entryPoints(sourceManifest),
];

/**
 * @param {string} command - Executable to run.
 * @param {string[]} args - Arguments for the executable.
 * @param {string} cwd - Working directory.
 * @returns {import('node:child_process').SpawnSyncReturns<string>} Captured command result.
 */
function run(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
  });
}

/**
 * @returns {{ tarball: string, pack: Record<string, unknown> }} Packed tarball path and npm pack metadata.
 */
function packPackage() {
  const result = run('npm', ['pack', '--json', '--ignore-scripts'], packageDir);
  if (result.status !== 0) {
    throw new Error(
      `npm pack failed.\n${result.stderr || result.stdout || ''}`.trim(),
    );
  }

  const parsed = JSON.parse(result.stdout);
  const pack = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!pack || typeof pack.filename !== 'string') {
    throw new Error('npm pack did not return a tarball filename.');
  }

  return {
    tarball: path.join(packageDir, pack.filename),
    pack,
  };
}

/**
 * @param {string} tarball - Absolute path of the packed tarball.
 * @returns {string[]} Paths inside the tarball, without the `package/` prefix.
 */
function packedFiles(tarball) {
  const result = run('tar', ['-tzf', tarball], repoRoot);
  if (result.status !== 0) {
    throw new Error(
      `Unable to list ${tarball}.\n${result.stderr || ''}`.trim(),
    );
  }

  return result.stdout
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.startsWith('package/'))
    .map((entry) => entry.slice('package/'.length))
    .filter((entry) => entry.length > 0 && !entry.endsWith('/'));
}

/**
 * @param {Record<string, unknown>} manifest - Package manifest for the directory being packed.
 * @returns {string[]} Relative paths declared by `exports`, `main`, and `types`.
 */
function entryPoints(manifest) {
  const paths = [];
  collectExportPaths(manifest.exports, paths);
  for (const field of ['main', 'types']) {
    if (typeof manifest[field] === 'string') {
      paths.push(manifest[field].replace(/^\.\//, ''));
    }
  }
  return [...new Set(paths)];
}

/**
 * @param {unknown} value - An exports value or nested condition object.
 * @param {string[]} paths - Collected relative entry-point paths.
 */
function collectExportPaths(value, paths) {
  if (typeof value === 'string' && value.startsWith('./')) {
    paths.push(value.slice(2));
    return;
  }
  if (!value || typeof value !== 'object') {
    return;
  }
  for (const nested of Object.values(value)) {
    collectExportPaths(nested, paths);
  }
}

/**
 * Source maps are kept. Tests, benchmarks, secrets, and tooling are not.
 * @param {string} file - Path inside the tarball, without the `package/` prefix.
 * @returns {boolean} Whether publishing this file should fail the release.
 */
function isUnintended(file) {
  if (file.endsWith('.map')) {
    return false;
  }

  const parts = file.split('/');
  const base = parts.at(-1) ?? file;
  if (base.startsWith('.env') && base !== '.env.example') {
    return true;
  }
  if (
    /\.(?:pem|key)$/.test(base) ||
    base === 'id_rsa' ||
    base === 'credentials.json'
  ) {
    return true;
  }
  if (/\.(?:test|spec|bench)\.[cm]?[jt]s$/.test(base)) {
    return true;
  }
  if (
    parts.includes('coverage') ||
    parts.includes('.github') ||
    parts.includes('node_modules')
  ) {
    return true;
  }
  return /^vitest\.config\./.test(base) || /^tsconfig.*\.json$/.test(base);
}

/**
 * @param {string} tarball - Absolute path of the packed tarball.
 * @param {string[]} files - Packed paths without the `package/` prefix.
 * @returns {string[]} Release-blocking problems.
 */
function releaseBlockers(tarball, files) {
  const manifestResult = run(
    'tar',
    ['-xOzf', tarball, 'package/package.json'],
    repoRoot,
  );
  if (manifestResult.status !== 0) {
    return ['package/package.json is not in the tarball.'];
  }

  const manifest = JSON.parse(manifestResult.stdout);
  const blockers = [];
  const present = new Set(files);

  for (const file of requiredFiles) {
    if (!present.has(file)) {
      blockers.push(`Required file ${file} is not in the tarball.`);
    }
  }

  const exportPaths = [];
  collectExportPaths(manifest.exports, exportPaths);
  for (const file of ['main', 'types']) {
    if (typeof manifest[file] === 'string') {
      exportPaths.push(manifest[file].replace(/^\.\//, ''));
    }
  }
  for (const file of new Set(exportPaths)) {
    if (!present.has(file)) {
      blockers.push(`Declared entry point ${file} is not in the tarball.`);
    }
  }

  if (manifest.name !== sourceManifest.name) {
    blockers.push(
      `Expected package name ${sourceManifest.name}, received ${manifest.name}.`,
    );
  }
  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    blockers.push('The packed package.json has no version.');
  }
  if (manifest.license !== 'MIT') {
    blockers.push(`Expected license MIT, received ${manifest.license}.`);
  }
  if (
    typeof manifest.engines?.node !== 'string' ||
    manifest.engines.node.length === 0
  ) {
    blockers.push(
      'The packed package.json does not declare supported Node versions.',
    );
  }

  for (const file of files) {
    if (isUnintended(file)) {
      blockers.push(`Unintended file ${file} would be published.`);
    }
  }

  return blockers;
}

/**
 * @param {string} tarball - Absolute path of the packed tarball.
 * @returns {number | null} publish-gauge exit status.
 */
function runGauge(tarball) {
  if (!existsSync(gaugeBin)) {
    throw new Error(
      'publish-gauge is not installed. Run pnpm install from the repository root.',
    );
  }

  mkdirSync(reportDir, { recursive: true });
  const result = spawnSync(
    gaugeBin,
    [
      packageDir,
      '--tarball',
      tarball,
      '--fail-on',
      'low',
      '--config',
      gaugeConfig,
      '--json',
      path.join(reportDir, 'publish-gauge.json'),
      '--markdown',
      path.join(reportDir, 'publish-gauge.md'),
    ],
    { cwd: packageDir, stdio: 'inherit' },
  );
  return result.status;
}

/**
 * @param {Record<string, unknown>} pack - Metadata returned by `npm pack --json`.
 * @param {string[]} files - Packed paths without the `package/` prefix.
 * @param {string[]} blockers - Release-blocking problems found outside publish-gauge.
 * @param {number | null} gaugeStatus - publish-gauge exit status.
 */
function writeSummary(pack, files, blockers, gaugeStatus) {
  const lines = [
    '## Package integrity',
    '',
    `- Package: \`${pack.name}@${pack.version}\``,
    `- Files: ${pack.entryCount ?? files.length}`,
    `- Packed size: ${pack.size} bytes`,
    `- Unpacked size: ${pack.unpackedSize} bytes`,
    `- Tarball: \`${pack.filename}\``,
    `- Required files: ${requiredFiles.every((file) => files.includes(file)) ? 'present' : 'missing'}`,
    `- publish-gauge: ${gaugeStatus === 0 ? 'passed' : `failed (exit ${gaugeStatus})`}`,
  ];

  if (blockers.length > 0) {
    lines.push('', '### Release blockers', '');
    for (const blocker of blockers) {
      lines.push(`- ${blocker}`);
    }
  }

  const summary = `${lines.join('\n')}\n`;
  process.stdout.write(`\n${summary}`);
  const markdownPath = path.join(reportDir, 'publish-gauge.md');
  if (existsSync(markdownPath)) {
    writeFileSync(
      markdownPath,
      `${readFileSync(markdownPath, 'utf8').trim()}\n\n${summary}`,
    );
  } else {
    mkdirSync(reportDir, { recursive: true });
    writeFileSync(markdownPath, summary);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      readFileSync(markdownPath, 'utf8'),
      { flag: 'a' },
    );
  }

  writeFileSync(path.join(reportDir, 'npm-tarball-name'), `${pack.filename}\n`);
}

if (!existsSync(path.join(packageDir, 'dist', 'index.js'))) {
  throw new Error(
    'dist/index.js is missing. Run pnpm build before pnpm verify:package.',
  );
}

const { tarball, pack } = packPackage();
const files = packedFiles(tarball);
const blockers = releaseBlockers(tarball, files);
for (const blocker of blockers) {
  process.stderr.write(`${blocker}\n`);
}
const gaugeStatus = runGauge(tarball);
writeSummary(pack, files, blockers, gaugeStatus);
if (blockers.length > 0 || gaugeStatus !== 0) {
  process.exit(1);
}
