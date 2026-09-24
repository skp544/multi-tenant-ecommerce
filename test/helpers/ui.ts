import { expect, type Page } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './env';
import { otpMailIds, waitForOtp } from './mailhog';

// Same key the app writes in platform-admin/src/lib/storage.ts
export const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';

export function readAccessToken(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), ACCESS_TOKEN_KEY);
}

/** Opens the login page and submits the form. */
export async function submitLogin(
  page: Page,
  email: string = ADMIN_EMAIL,
  password: string = ADMIN_PASSWORD,
) {
  await page.goto('/auth/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
}

/** Types the code into the OTP input and presses Verify (login page and My Account dialog). */
export async function submitOtp(page: Page, otp: string) {
  await page.locator('input[data-input-otp]').fill(otp);
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
}

/** Full sign in for an account with 2FA on: password, emailed code, dashboard. */
export async function signInWithTwoFactor(page: Page) {
  const seen = await otpMailIds(ADMIN_EMAIL);

  await submitLogin(page);
  await expect(page).toHaveURL(/\/auth\/2fa$/);

  await submitOtp(page, await waitForOtp(ADMIN_EMAIL, seen));
  await expect(page).toHaveURL(/\/dashboard/);
}
