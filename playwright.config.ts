import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env.CI;
const port = Number(process.env.PLAYWRIGHT_SERVER_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;

/**
 * Playwright configuration for TimeSpan browser distribution tests.
 * Tests run against the built `dist/` artifacts, not TypeScript source.
 */
export default defineConfig({
  testDir: './tests/browser',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: isCi ? 'never' : 'on-failure' }]],
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
    command: `node tests/browser/serve.cjs`,
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
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
