import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Parse even-numbered LTS majors from an npm engines.node range.
 * @param enginesNode - The `engines.node` range from package.json.
 * @returns Sorted even major versions.
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
 * @param root - Repository root directory.
 * @returns Sorted even major versions.
 */
function readFromPackage(root) {
  const packageJsonPath = path.join(
    root,
    'packages',
    'timespan',
    'package.json',
  );
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  return supportedNodeMajors(pkg.engines && pkg.engines.node);
}

/**
 * Shape the majors list for CLI and GitHub Actions output.
 * @param majors - Sorted even major versions.
 * @returns Matrix strings and the newest major.
 */
function report(majors) {
  return {
    majors,
    matrix: majors.map((major) => `${major}.x`),
    latest: majors[majors.length - 1],
  };
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const root = path.resolve(import.meta.dirname, '..');
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
    appendFileSync(outputFile, `matrix=${JSON.stringify(info.matrix)}\n`);
    appendFileSync(outputFile, `latest=${info.latest}\n`);
    process.exit(0);
  }

  process.stdout.write(`${JSON.stringify(info, null, 2)}\n`);
}

export { readFromPackage, report, supportedNodeMajors };
