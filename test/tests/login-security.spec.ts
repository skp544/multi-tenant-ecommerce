import { expect, test } from '@playwright/test';
import { api } from '../helpers/api';
import { ADMIN_EMAIL } from '../helpers/env';
import { submitLogin } from '../helpers/ui';

const GENERIC_ERROR = 'Invalid email or password.';

async function medianMs(run: () => Promise<unknown>, times: number) {
  const durations: number[] = [];

  for (let i = 0; i < times; i++) {
    const start = performance.now();
    await run();
    durations.push(performance.now() - start);
  }

  return durations.sort((a, b) => a - b)[Math.floor(times / 2)];
}

test.describe('login errors', () => {
  test('an unknown email and a wrong password get the same response', async () => {
    const unknown = await api.login(
      `nobody-${Date.now()}@example.com`,
      'some-password-123',
    );
    const wrongPassword = await api.login(ADMIN_EMAIL, 'some-password-123');

    expect(unknown.status).toBe(400);
    expect(unknown.body.message).toBe(GENERIC_ERROR);
    expect(unknown.body).toEqual(wrongPassword.body);
    expect(unknown.status).toBe(wrongPassword.status);
  });

  // Without the dummy hash comparison an unknown email skips bcrypt and is
  // answered in a few ms, against ~50-100ms for a wrong password. The bound is
  // deliberately loose so it only trips on that gap.
  test('an unknown email takes about as long as a wrong password', async () => {
    const unknownEmail = await medianMs(
      () => api.login(`nobody-${Date.now()}@example.com`, 'some-password-123'),
      7,
    );
    const wrongPassword = await medianMs(
      () => api.login(ADMIN_EMAIL, 'some-password-123'),
      7,
    );

    expect(unknownEmail).toBeGreaterThan(wrongPassword * 0.5);
  });

  test('the sign in form shows the error and stays on the page', async ({
    page,
  }) => {
    await submitLogin(page, ADMIN_EMAIL, 'wrong-password-123');

    await expect(page.getByText(GENERIC_ERROR)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
