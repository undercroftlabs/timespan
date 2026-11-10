/* eslint-disable @typescript-eslint/no-var-requires */
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const { codecovRollupPlugin } = require('@codecov/rollup-plugin');

module.exports = {
  input: 'dist/index.js',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'Timespan',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    terser(),
    codecovRollupPlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: '@undercroft/timespan',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};
