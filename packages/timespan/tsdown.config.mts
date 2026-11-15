import { createRequire } from 'node:module';
import { defineConfig } from 'tsdown';

const require = createRequire(import.meta.url);

const plugins = [];

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

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: {
    esm: {},
    cjs: {},
    umd: {
      entry: { index: 'entries/umd.ts' },
      dts: false,
      plugins,
    },
  },
  fixedExtension: false,
  platform: 'neutral',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  globalName: 'Timespan',
  dts: true,
  outputOptions(options, format) {
    options.exports = format === 'umd' ? 'default' : 'named';
  },
});
