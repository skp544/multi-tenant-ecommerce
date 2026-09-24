import { expect, test } from '@playwright/test';
import { api, ensureTwoFactorDisabled } from '../helpers/api';
import { ADMIN_EMAIL } from '../helpers/env';
import { otpMailIds, waitForOtp } from '../helpers/mailhog';
import {
  readAccessToken,
  signInWithTwoFactor,
  submitLogin,
  submitOtp,
} from '../helpers/ui';

// The steps build on each other: 2FA is switched on in the second test and
// off again in the last one, so they must run in order.
test.describe.serial('two-factor login', () => {
  test.beforeAll(ensureTwoFactorDisabled);
  test.afterAll(ensureTwoFactorDisabled);

  test('signs in without a second step while 2FA is off', async ({ page }) => {
    await submitLogin(page);

    await expect(page).toHaveURL(/\/dashboard/);
    expect(await readAccessToken(page)).not.toBeNull();
  });

  test('enables 2FA from My Account with an emailed code', async ({ page }) => {
    await submitLogin(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/dashboard/my-account');

    const seen = await otpMailIds(ADMIN_EMAIL);

    await page.getByRole('button', { name: 'Enable', exact: true }).click();
    await page.getByRole('button', { name: 'Send OTP' }).click();

    await submitOtp(page, await waitForOtp(ADMIN_EMAIL, seen));

    await expect(
      page.getByRole('button', { name: 'Disable', exact: true }),
    ).toBeVisible();
  });

  // Regression: the 2FA branch used to run before the password check, so any
  // password got a two factor token and triggered an OTP email.
  test('a wrong password gets no token and no code while 2FA is on', async () => {
    const seen = await otpMailIds(ADMIN_EMAIL);

    const result = await api.login(ADMIN_EMAIL, 'definitely-not-the-password');

    expect(result.status).toBe(400);
    expect(result.body.data).toBeNull();
    expect(result.body.message).toBe('Invalid email or password.');

    // The email is sent before login responds, so it would already be here
    expect(await otpMailIds(ADMIN_EMAIL)).toEqual(seen);
  });

  test('asks for the emailed code after the password and then signs in', async ({
    page,
  }) => {
    const seen = await otpMailIds(ADMIN_EMAIL);

    await submitLogin(page);

    await expect(page).toHaveURL(/\/auth\/2fa$/);
    await expect(
      page.getByRole('heading', { name: 'Two-Factor Authentication' }),
    ).toBeVisible();
    await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();

    // No session yet, only the two factor token in memory
    expect(await readAccessToken(page)).toBeNull();

    await submitOtp(page, await waitForOtp(ADMIN_EMAIL, seen));

    await expect(page).toHaveURL(/\/dashboard/);
    expect(await readAccessToken(page)).not.toBeNull();
  });

  test('rejects a wrong code, then reuses the earlier code inside the resend cooldown', async ({
    page,
  }) => {
    const seen = await otpMailIds(ADMIN_EMAIL);

    await submitLogin(page);
    await expect(page).toHaveURL(/\/auth\/2fa$/);

    const otp = await waitForOtp(ADMIN_EMAIL, seen);
    const wrongOtp = otp === '000000' ? '111111' : '000000';

    await submitOtp(page, wrongOtp);

    await expect(page.getByText('Invalid OTP.')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/2fa$/);
    expect(await readAccessToken(page)).toBeNull();

    // Signing in again straight away must not be blocked, and must not send
    // another email (a new code would reset the attempt limit)
    const afterFirstCode = await otpMailIds(ADMIN_EMAIL);

    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await submitLogin(page);

    await expect(
      page.getByText('A code was already sent to your email. Please use it.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/2fa$/);
    expect(await otpMailIds(ADMIN_EMAIL)).toEqual(afterFirstCode);

    await submitOtp(page, otp);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('refreshing the code page goes back to the sign in form', async ({
    page,
  }) => {
    const seen = await otpMailIds(ADMIN_EMAIL);

    await submitLogin(page);
    await expect(page).toHaveURL(/\/auth\/2fa$/);

    const otp = await waitForOtp(ADMIN_EMAIL, seen);

    // The two factor token only lives in memory
    await page.reload();
    await expect(page).toHaveURL(/\/auth\/login$/);

    // The code from the first sign in is still valid, and using it also
    // leaves no unused code behind for the next test
    await submitLogin(page);
    await expect(page).toHaveURL(/\/auth\/2fa$/);
    await submitOtp(page, otp);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('disables 2FA again from My Account', async ({ page }) => {
    await signInWithTwoFactor(page);
    await page.goto('/dashboard/my-account');

    const seen = await otpMailIds(ADMIN_EMAIL);

    await page.getByRole('button', { name: 'Disable', exact: true }).click();
    await page.getByRole('button', { name: 'Send OTP' }).click();

    await submitOtp(page, await waitForOtp(ADMIN_EMAIL, seen));

    await expect(
      page.getByRole('button', { name: 'Enable', exact: true }),
    ).toBeVisible();
  });
});
