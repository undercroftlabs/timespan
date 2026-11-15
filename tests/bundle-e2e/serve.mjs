import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Find the installed library package by walking up from its resolved entry.
 * The package exports map does not expose package.json, so the entry file is
 * the reliable starting point.
 * @param startDir - Directory that contains or sits inside the package.
 * @returns The package root and its parsed package.json.
 */
function findPackage(startDir) {
  let dir = startDir;
  for (;;) {
    const candidate = path.join(dir, 'package.json');
    try {
      const pkg = JSON.parse(readFileSync(candidate, 'utf8'));
      if (pkg.name === '@undercroft/timespan') {
        return { root: dir, pkg };
      }
    } catch {
      // This directory is not the package root.
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        'Could not find the installed @undercroft/timespan package.',
      );
    }
    dir = parent;
  }
}

const entryPath = fileURLToPath(import.meta.resolve('@undercroft/timespan'));
const { root: packageRoot, pkg: packageJson } = findPackage(
  path.dirname(entryPath),
);
const fixturesRoot = path.join(import.meta.dirname, 'fixtures');
const port = Number(process.env.PLAYWRIGHT_SERVER_PORT || 4173);
const host = '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
};

/**
 * Resolve a published export target from the installed package.
 * @param exportPath - Package export key, such as `.` or `./umd`.
 * @param condition - Export condition to follow when the entry is conditional.
 * @returns Absolute path of the published file.
 */
function resolvePublishedFile(exportPath, condition) {
  const entry = packageJson.exports[exportPath];
  if (typeof entry === 'string') {
    return path.join(packageRoot, entry);
  }
  const target =
    typeof entry.default === 'string'
      ? entry.default
      : entry[condition].default;
  return path.join(packageRoot, target);
}

const umdFixture = path.join(fixturesRoot, 'umd.html');
const esmFixture = path.join(fixturesRoot, 'esm.html');
const umdBundle = resolvePublishedFile('./umd', 'require');
const esmBundle = resolvePublishedFile('.', 'import');

/**
 * Map a request URL to a fixture or a file from the installed package.
 * Only exact known paths are served so request data never reaches the filesystem.
 * @param requestUrl - Raw request URL, including an optional query string.
 * @returns Absolute file path, or `null` when the URL is not allowed.
 */
function lookupAllowedFile(requestUrl) {
  let decoded;
  try {
    decoded = decodeURIComponent(requestUrl.split('?')[0]);
  } catch {
    return null;
  }

  switch (decoded) {
    case '/':
    case '/umd.html':
      return umdFixture;
    case '/esm.html':
      return esmFixture;
    case '/dist/index.umd.js':
      return umdBundle;
    case '/dist/index.umd.js.map':
      return `${umdBundle}.map`;
    case '/dist/index.mjs':
      return esmBundle;
    case '/dist/index.mjs.map':
      return `${esmBundle}.map`;
    default:
      return null;
  }
}

const server = createServer((req, res) => {
  const filePath = lookupAllowedFile(req.url || '/');
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let stats;
  try {
    stats = statSync(filePath);
  } catch {
    stats = undefined;
  }
  if (!stats?.isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const contentType =
    mimeTypes[path.extname(filePath).toLowerCase()] ||
    'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  process.stdout.write(
    `Timespan fixture server listening on http://${host}:${port}\n`,
  );
});
