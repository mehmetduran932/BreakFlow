import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Deterministic single worker execution
  use: {
    ...devices['Desktop Chrome'],
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
