// Optimized consumer budget. Size Limit minifies each published build, then
// measures Brotli. These limits are not the raw, gzip, or Brotli size of the
// files shipped on npm.
module.exports = [
  {
    path: 'dist/index.js',
    limit: '4 KB',
  },
  {
    path: 'dist/index.mjs',
    limit: '4 KB',
  },
  {
    path: 'dist/index.umd.js',
    limit: '4 KB',
  },
];
