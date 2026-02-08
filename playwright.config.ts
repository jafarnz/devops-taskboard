import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, 
  workers: 3, 
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
  ],
  timeout: 15000,
  expect: {
    timeout: 3000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 3000,
    navigationTimeout: 10000,
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
      use: {
        ...devices['Desktop Safari'],
        // WebKit needs more time on resource-constrained systems
        actionTimeout: 5000,
        navigationTimeout: 15000,
      },
    },
  ],
  webServer: {
    command: 'node index.js',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      TASKS_FILE: 'test-results/taskboard.test.json',
      TEMPLATE_FILE: 'utils/taskboard.template.json',
    },
    timeout: 60 * 1000,
  },
});
