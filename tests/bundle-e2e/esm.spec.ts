import { expect, test } from '@playwright/test';
import {
  expectNoPageErrors,
  expectPublicApiContract,
  waitForBundle,
} from './timespan-contract';

test.describe('ESM browser distribution', () => {
  test('imports dist/index.mjs and exposes the documented exports', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const [esmResponse] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().endsWith('/dist/index.mjs'),
      ),
      page.goto('/esm.html', { waitUntil: 'domcontentloaded' }),
    ]);

    expect(esmResponse.status()).toBe(200);
    await waitForBundle(page);

    const exportsInfo = await page.evaluate(() => ({
      named: typeof window.Timespan,
      defaultExport: typeof window.TimespanDefault,
      sameReference: window.Timespan === window.TimespanDefault,
    }));

    expect(exportsInfo.named).toBe('function');
    expect(exportsInfo.defaultExport).toBe('function');
    expect(exportsInfo.sameReference).toBe(true);

    await expectPublicApiContract(page);
    await expectNoPageErrors(page);
    expect(pageErrors).toEqual([]);
  });
});
