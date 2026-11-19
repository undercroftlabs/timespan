import { spawnSync } from 'node:child_process';

const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

/**
 * Run pnpm. Windows installs the shim as `pnpm.cmd`. Node cannot execute a
 * `.cmd` file directly, so the spawn goes through the shell there.
 * @param {string[]} args - Arguments for pnpm.
 * @param {import('node:child_process').SpawnSyncOptions} options - Spawn options.
 * @returns {import('node:child_process').SpawnSyncReturns<string | Buffer>} Captured command result.
 */
export function runPnpm(args, options) {
  return spawnSync(pnpmCommand, args, {
    ...options,
    shell: process.platform === 'win32',
  });
}
