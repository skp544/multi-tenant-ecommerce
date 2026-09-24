import { expect, test } from '@playwright/test';

test.describe('reset password page', () => {
  // Regression: isDone used to start as true, so the form never showed
  test('shows the form instead of the done screen', async ({ page }) => {
    await page.goto('/auth/reset-password');

    await expect(
      page.getByRole('heading', { name: 'Reset Password' }),
    ).toBeVisible();
    await expect(page.getByText('Password Updated')).toBeHidden();
  });

  test('flags passwords that do not match', async ({ page }) => {
    await page.goto('/auth/reset-password');

    await page.locator('#password').fill('new-password-1');
    await page.locator('#confirm-password').fill('new-password-2');

    await expect(page.getByText('Password does not match')).toBeVisible();
  });

  // There is no reset token when the page is opened directly
  test('refuses to submit without a reset token', async ({ page }) => {
    await page.goto('/auth/reset-password');

    await page.locator('#password').fill('new-password-1');
    await page.locator('#confirm-password').fill('new-password-1');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByText('Password Updated')).toBeHidden();
  });
});
