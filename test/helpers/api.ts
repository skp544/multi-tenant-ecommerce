import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from './env';
import { latestOtp, otpMailIds, waitForOtp } from './mailhog';

interface Tokens {
  accessToken: string;
  refreshToken: string;
  userType: string;
}

interface TwoFactorRequired {
  requiredTwoFactor: true;
  twoFactorToken: string;
  message: string;
}

export interface ApiResult<T> {
  status: number;
  body: { success: boolean; data: T | null; message: string };
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string } = {},
): Promise<ApiResult<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  return { status: response.status, body: await response.json() };
}

export const api = {
  login: (email: string, password: string) =>
    request<Tokens | TwoFactorRequired>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  verifyLogin2FA: (twoFactorToken: string, otp: string) =>
    request<Tokens>('/auth/login/2fa', {
      method: 'POST',
      body: { twoFactorToken, otp },
    }),

  sendOtp: (accessToken: string) =>
    request<null>('/auth/2fa-generate-otp', { accessToken }),

  verifyOtp: (accessToken: string, otp: string, enable: boolean) =>
    request<null>('/auth/2fa-verify-otp', {
      method: 'POST',
      accessToken,
      body: { otp, enable },
    }),
};

function assertOk(result: ApiResult<unknown>, action: string) {
  if (result.status >= 400) {
    throw new Error(`${action} failed: ${result.status} ${result.body.message}`);
  }
}

/**
 * Puts the admin account back to "2FA off" through the API, so a run always
 * starts from (and leaves behind) the state the seed creates, even after a
 * failed run.
 */
export async function ensureTwoFactorDisabled(): Promise<void> {
  const seen = await otpMailIds(ADMIN_EMAIL);
  const login = await api.login(ADMIN_EMAIL, ADMIN_PASSWORD);

  assertOk(login, `Signing in as ${ADMIN_EMAIL}`);

  if (!login.body.data) {
    throw new Error('Login returned no data');
  }

  // Tokens straight away means 2FA is already off
  if ('accessToken' in login.body.data) return;

  // Inside the resend cooldown the backend reuses the earlier code, no new email
  const loginOtp = await waitForOtp(ADMIN_EMAIL, seen, 5_000).catch(() =>
    latestOtp(ADMIN_EMAIL),
  );

  const verified = await api.verifyLogin2FA(
    login.body.data.twoFactorToken,
    loginOtp,
  );
  assertOk(verified, 'Verifying the login code');

  const accessToken = verified.body.data?.accessToken;
  if (!accessToken) {
    throw new Error('Verifying the login code returned no access token');
  }

  const beforeDisable = await otpMailIds(ADMIN_EMAIL);
  assertOk(await api.sendOtp(accessToken), 'Sending the disable code');

  const disableOtp = await waitForOtp(ADMIN_EMAIL, beforeDisable);
  assertOk(
    await api.verifyOtp(accessToken, disableOtp, false),
    'Disabling 2FA',
  );
}
