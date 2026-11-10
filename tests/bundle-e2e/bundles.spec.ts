import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * Node-side Playwright checks. These import the installed package name,
 * so they follow the exports map and fail if dist has not been built.
 * The UMD global is covered in umd.spec.ts because browsers cannot load CJS.
 */
test.describe('installed CJS and ESM bundles', () => {
  test('resolve through the package exports map', async () => {
    const cjs = require('@undercroft/timespan');
    expect(typeof cjs.Timespan).toBe('function');

    const esm = await import('@undercroft/timespan');
    expect(typeof esm.Timespan).toBe('function');
    expect(esm.default).toBe(esm.Timespan);
  });
});
