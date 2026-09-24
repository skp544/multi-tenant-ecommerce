import { defineConfig, devices } from '@playwright/test';
import { WEB_URL } from './helpers/env';

// Needs Postgres and Mailhog (docker compose up -d mailhog) running.
// The backend and the platform admin are started here unless they already are.
export default defineConfig({
  testDir: './tests',

  // The specs share one admin account and its 2FA state, so they run one at a time
  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: WEB_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command: 'npm run start',
      cwd: '../backend',
      port: 4000,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      cwd: '../platform-admin',
      port: 3002,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
