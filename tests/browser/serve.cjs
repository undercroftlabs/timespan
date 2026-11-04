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
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
};

/**
 * Resolve a request path to a file under dist/ or the fixture directory.
 * @param {string} requestUrl
 * @returns {string | null}
 */
function resolveSafePath(requestUrl) {
  const decoded = decodeURIComponent(requestUrl.split('?')[0]);
  const normalized = path.posix.normalize(decoded);

  if (normalized === '/' || normalized === '.') {
    return path.join(fixturesRoot, 'umd.html');
  }

  let candidate;
  if (normalized === '/dist' || normalized.startsWith('/dist/')) {
    candidate = path.join(distRoot, normalized.slice('/dist'.length));
  } else {
    candidate = path.join(fixturesRoot, normalized);
  }

  const resolved = path.resolve(candidate);
  const allowedRoots = [fixturesRoot, distRoot];
  const isAllowed = allowedRoots.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep),
  );

  if (!isAllowed) {
    return null;
  }

  return resolved;
}

const server = http.createServer((req, res) => {
  const filePath = resolveSafePath(req.url || '/');
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
