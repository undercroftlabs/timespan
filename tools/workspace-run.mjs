import path from 'node:path';
import { runPnpm } from './run-pnpm.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

/** Short names for the publishable workspace packages. */
const packages = {
  timespan: '@undercroft/timespan',
  rtspan: '@undercroft/react-timespan',
};

const scriptName = process.argv[2];
const hasTarget = process.argv.length > 3;
const target = hasTarget ? process.argv[3] : 'all';
const extra = process.argv.slice(4);

if (!scriptName) {
  process.stderr.write(
    'Usage: node tools/workspace-run.mjs <script> [package]\n',
  );
  process.exit(1);
}

const args = pnpmArgs(scriptName, target, extra);
const result = runPnpm(args, {
  cwd: repoRoot,
  stdio: 'inherit',
});

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status ?? 1);

/**
 * @param {string} script - Package script name, such as `build` or `test`.
 * @param {string} target - `timespan`, `rtspan`, or `all`.
 * @param {string[]} extra - Arguments forwarded to that package script.
 * @returns {string[]} Arguments for `pnpm`.
 */
function pnpmArgs(script, target, extra) {
  const forwarded = extra.length > 0 ? ['--', ...extra] : [];

  if (target === 'all') {
    return [
      '--filter',
      './packages/*',
      '--recursive',
      'run',
      script,
      ...forwarded,
    ];
  }

  const packageName = packages[target];
  if (!packageName) {
    const names = [...Object.keys(packages), 'all'].join(', ');
    process.stderr.write(`Unknown package "${target}". Use ${names}.\n`);
    process.exit(1);
  }

  return ['--filter', packageName, 'run', script, ...forwarded];
}
