'use strict';

const path = require('path');

const lockfilePath = path.join(__dirname, '..', 'package-lock.json');
const lockfile = require(lockfilePath);
const pkg = lockfile.packages && lockfile.packages['node_modules/@playwright/test'];

if (!pkg || !pkg.version) {
  throw new Error(
    'Could not read node_modules/@playwright/test version from package-lock.json',
  );
}

const version = pkg.version;
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
