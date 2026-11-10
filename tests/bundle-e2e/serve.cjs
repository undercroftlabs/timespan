'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { createRequire } = require('node:module');

const requireFromPackage = createRequire(__filename);
const packageJsonPath = requireFromPackage.resolve(
  '@undercroft/timespan/package.json',
);
const packageRoot = path.dirname(packageJsonPath);
const packageJson = requireFromPackage(packageJsonPath);
const fixturesRoot = path.join(__dirname, 'fixtures');
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
 * @param {string} exportPath
 * @param {'import' | 'require'} condition
 * @returns {string}
 */
function resolvePublishedFile(exportPath, condition) {
  const entry = packageJson.exports[exportPath];
  if (typeof entry === 'string') {
    return path.join(packageRoot, entry);
  }
  const target =
    typeof entry.default === 'string' ? entry.default : entry[condition].default;
  return path.join(packageRoot, target);
}

const umdFixture = path.join(fixturesRoot, 'umd.html');
const esmFixture = path.join(fixturesRoot, 'esm.html');
const umdBundle = resolvePublishedFile('./umd', 'require');
const esmBundle = resolvePublishedFile('.', 'import');

/**
 * Map a request URL to a fixture or a file from the installed package.
 * Only exact known paths are served so request data never reaches the filesystem.
 * @param {string} requestUrl
 * @returns {string | null}
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

const server = http.createServer((req, res) => {
  const filePath = lookupAllowedFile(req.url || '/');
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
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
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, host, () => {
  process.stdout.write(
    `Timespan fixture server listening on http://${host}:${port}\n`,
  );
});
