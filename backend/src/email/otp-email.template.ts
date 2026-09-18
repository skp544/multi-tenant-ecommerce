const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Colors mirror the platform-admin theme (src/index.css), converted to hex for email clients
export const otpEmailTemplate = (
  username: string,
  otp: string,
  expiresIn: string,
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your verification code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f2f8f3;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f8f3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border:1px solid #cfe3d3;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#10543a;background-image:linear-gradient(135deg,#06251a,#10543a);padding:28px 32px;">
                <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Platform Admin</p>
                <p style="margin:8px 0 0;color:#c7dccb;font-size:13px;line-height:1.5;">Two-factor authentication</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#9fe870;height:3px;line-height:3px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px;color:#0c1f16;font-size:15px;line-height:1.6;">
                <p style="margin:0 0 12px;font-size:18px;font-weight:600;">Hi ${escapeHtml(username)},</p>
                <p style="margin:0 0 24px;color:#4a6155;">Use the code below to complete your two-factor authentication.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td align="center" style="background-color:#f2f8f3;border:1px solid #cfe3d3;border-radius:8px;padding:20px 16px;">
                      <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1a7a4f;font-family:'Courier New',Courier,monospace;">${escapeHtml(otp)}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 12px;color:#0c1f16;font-size:14px;font-weight:600;">
                  This code expires in ${escapeHtml(expiresIn)}.
                </p>
                <p style="margin:0;color:#4a6155;font-size:13px;">
                  Do not share this code with anyone. If you did not request it, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f2f8f3;border-top:1px solid #cfe3d3;padding:16px 32px;color:#4a6155;font-size:12px;">
                &copy; ${new Date().getFullYear()} Platform Admin. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
