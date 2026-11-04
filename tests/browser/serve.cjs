'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const fixturesRoot = path.join(__dirname, 'fixtures');
const distRoot = path.join(repoRoot, 'dist');
const port = Number(process.env.PLAYWRIGHT_SERVER_PORT || 4173);
const host = '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
};

const umdFixture = path.join(fixturesRoot, 'umd.html');
const esmFixture = path.join(fixturesRoot, 'esm.html');
const umdBundle = path.join(distRoot, 'index.umd.js');
const umdSourceMap = path.join(distRoot, 'index.umd.js.map');
const esmBundle = path.join(distRoot, 'index.mjs');
const esmSourceMap = path.join(distRoot, 'index.mjs.map');

/**
 * Map a request URL to a hardcoded fixture or dist file.
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
      return umdSourceMap;
    case '/dist/index.mjs':
      return esmBundle;
    case '/dist/index.mjs.map':
      return esmSourceMap;
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
