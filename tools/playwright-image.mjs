import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const lockfilePath = path.join(import.meta.dirname, '..', 'pnpm-lock.yaml');
const lockfile = readFileSync(lockfilePath, 'utf8');
const versionMatch = lockfile.match(/@playwright\/test@(\d+\.\d+\.\d+)/);

if (!versionMatch) {
  throw new Error(
    'Could not read @playwright/test version from pnpm-lock.yaml',
  );
}

const version = versionMatch[1];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const flag = process.argv[2];
  if (flag === '--version') {
    process.stdout.write(`${version}\n`);
  } else {
    process.stdout.write(`${image}\n`);
  }
}

export { image, version };
