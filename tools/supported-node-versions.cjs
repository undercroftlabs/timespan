'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Parse even-numbered LTS majors from an npm engines.node range.
 * @param {string} enginesNode
 * @returns {number[]}
 */
function supportedNodeMajors(enginesNode) {
  if (!enginesNode || typeof enginesNode !== 'string') {
    throw new Error('package.json engines.node is missing.');
  }

  const majors = new Set();
  for (const clause of enginesNode.split('||')) {
    const match = clause.trim().match(/^[v>=^~]*\s*(\d+)/i);
    if (!match) {
      throw new Error(`Cannot parse engines.node clause: "${clause.trim()}"`);
    }
    const major = Number(match[1]);
    if (!Number.isInteger(major) || major < 18 || major % 2 !== 0) {
      throw new Error(
        `engines.node must list even-numbered LTS majors (>= 18). Found "${clause.trim()}"`,
      );
    }
    majors.add(major);
  }

  if (majors.size === 0) {
    throw new Error('engines.node did not contain any LTS majors.');
  }

  return [...majors].sort((a, b) => a - b);
}

/**
 * Read supported Node majors from the repo package.json.
 * @param {string} root
 * @returns {number[]}
 */
function readFromPackage(root) {
  const packageJsonPath = path.join(root, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return supportedNodeMajors(pkg.engines && pkg.engines.node);
}

/**
 * @param {number[]} majors
 */
function report(majors) {
  return {
    majors,
    matrix: majors.map((major) => `${major}.x`),
    latest: majors[majors.length - 1],
  };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const info = report(readFromPackage(root));
  const args = new Set(process.argv.slice(2));

  if (args.has('--latest')) {
    process.stdout.write(`${info.latest}\n`);
    process.exit(0);
  }

  if (args.has('--matrix')) {
    process.stdout.write(`${JSON.stringify(info.matrix)}\n`);
    process.exit(0);
  }

  if (args.has('--github-output')) {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (!outputFile) {
      throw new Error('GITHUB_OUTPUT is not set.');
    }
    fs.appendFileSync(outputFile, `matrix=${JSON.stringify(info.matrix)}\n`);
    fs.appendFileSync(outputFile, `latest=${info.latest}\n`);
    process.exit(0);
  }

  process.stdout.write(`${JSON.stringify(info, null, 2)}\n`);
}

module.exports = {
  supportedNodeMajors,
  readFromPackage,
  report,
};
