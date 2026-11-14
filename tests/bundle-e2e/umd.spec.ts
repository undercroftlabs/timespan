import { expect, test } from '@playwright/test';
import {
  expectNoPageErrors,
  expectPublicApiContract,
  waitForBundle,
} from './timespan-contract';

test.describe('UMD browser distribution', () => {
  test('loads index.umd.js and exposes window.Timespan', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const [umdResponse] = await Promise.all([
      page.waitForResponse((response) =>
        response.url().endsWith('/dist/index.umd.js'),
      ),
      page.goto('/umd.html', { waitUntil: 'load' }),
    ]);

    expect(umdResponse.status()).toBe(200);
    await waitForBundle(page);

    const globalType = await page.evaluate(() => typeof window.Timespan);
    expect(globalType).toBe('function');

    await expectPublicApiContract(page);
    await expectNoPageErrors(page);
    expect(pageErrors).toEqual([]);
  });
});
