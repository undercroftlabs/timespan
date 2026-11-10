import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(packageDir, '../..');
const isCi = !!process.env.CI;
const port = Number(process.env.PLAYWRIGHT_SERVER_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;

/**
 * Playwright configuration for TimeSpan browser distribution tests.
 * Tests run against the built package, not TypeScript source.
 */
export default defineConfig({
  testDir: packageDir,
  testMatch: '**/*.spec.ts',
  outputDir: path.join(repoRoot, 'test-results'),
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    [
      'html',
      {
        open: isCi ? 'never' : 'on-failure',
        outputFolder: path.join(repoRoot, 'playwright-report'),
      },
    ],
  ],
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  webServer: {
    command: 'node serve.mjs',
    cwd: packageDir,
    url: `${baseURL}/umd.html`,
    reuseExistingServer: !isCi,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      PLAYWRIGHT_SERVER_PORT: String(port),
    },
  },
  projects: [
    {
      name: 'node-bundles',
      testMatch: /bundles\.spec\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /bundles\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: /bundles\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: /bundles\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
