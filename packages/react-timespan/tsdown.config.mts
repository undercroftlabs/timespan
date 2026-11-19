import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  fixedExtension: false,
  platform: 'neutral',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  dts: true,
  deps: {
    neverBundle: ['react', 'react-dom'],
  },
  outputOptions(options) {
    options.exports = 'named';
  },
});
