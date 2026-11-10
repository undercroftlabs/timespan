const terser = require('@rollup/plugin-terser');

const plugins = [terser()];

if (process.env.CODECOV_BUNDLE_ANALYSIS === '1') {
  const { codecovRollupPlugin } = require('@codecov/rollup-plugin');
  plugins.push(
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: '@undercroft/timespan',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  );
}

module.exports = {
  input: 'dist/index.js',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'Timespan',
    sourcemap: true,
  },
  plugins,
};
