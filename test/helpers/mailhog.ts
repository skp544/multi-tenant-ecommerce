import { MAILHOG_URL } from './env';

const OTP_SUBJECT = 'Your 2FA verification code';

interface MailhogMessage {
  ID: string;
  Content: {
    Headers: Record<string, string[] | undefined>;
    Body: string;
  };
}

// Newest first. Mailhog may be shared with other projects, so only the
// 2FA emails sent to this address are looked at.
async function otpMessagesTo(email: string): Promise<MailhogMessage[]> {
  const url = `${MAILHOG_URL}/api/v2/search?kind=to&query=${encodeURIComponent(email)}&limit=50`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Mailhog responded with ${response.status} for ${url}`);
  }

  const { items } = (await response.json()) as { items: MailhogMessage[] };

  return items.filter((m) => m.Content.Headers.Subject?.[0] === OTP_SUBJECT);
}

function decodeBody(message: MailhogMessage): string {
  const encoding =
    message.Content.Headers['Content-Transfer-Encoding']?.[0]?.toLowerCase();
  const body = message.Content.Body;

  if (encoding === 'quoted-printable') {
    return body
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/gi, (_, hex: string) =>
        String.fromCharCode(parseInt(hex, 16)),
      );
  }

  if (encoding === 'base64') {
    return Buffer.from(body, 'base64').toString('utf8');
  }

  return body;
}

// The code is the only 6 digit text node in the template: <span ...>123456</span>
function extractOtp(message: MailhogMessage): string {
  const match = decodeBody(message).match(/>\s*(\d{6})\s*</);

  if (!match) {
    throw new Error('No 6 digit code found in the 2FA email');
  }

  return match[1];
}

/** Ids of the 2FA emails already in the mailbox, taken before the action under test. */
export async function otpMailIds(email: string): Promise<Set<string>> {
  return new Set((await otpMessagesTo(email)).map((m) => m.ID));
}

/** Waits for a 2FA email that is not in `seen` and returns its code. */
export async function waitForOtp(
  email: string,
  seen: Set<string>,
  timeoutMs = 15_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const fresh = (await otpMessagesTo(email)).find((m) => !seen.has(m.ID));

    if (fresh) return extractOtp(fresh);

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`No new 2FA email for ${email} within ${timeoutMs}ms`);
}

/** The code of the newest 2FA email, for when the backend reuses an earlier one. */
export async function latestOtp(email: string): Promise<string> {
  const [latest] = await otpMessagesTo(email);

  if (!latest) {
    throw new Error(`No 2FA email found for ${email}`);
  }

  return extractOtp(latest);
}
