'use strict';

const fs = require('fs');
const path = require('path');

const lockfilePath = path.join(__dirname, '..', 'pnpm-lock.yaml');
const lockfile = fs.readFileSync(lockfilePath, 'utf8');
const versionMatch = lockfile.match(/@playwright\/test@(\d+\.\d+\.\d+)/);

if (!versionMatch) {
  throw new Error(
    'Could not read @playwright/test version from pnpm-lock.yaml',
  );
}

const version = versionMatch[1];
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

if (require.main === module) {
  const flag = process.argv[2];
  if (flag === '--version') {
    process.stdout.write(`${version}\n`);
  } else {
    process.stdout.write(`${image}\n`);
  }
}

module.exports = { version, image };
