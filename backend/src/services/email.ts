import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

/*
|--------------------------------------------------------------------------
| Email Service (Resend)
|--------------------------------------------------------------------------
| Thin wrapper around Resend, mirroring the notification-insert pattern
| used throughout the codebase (e.g. services/admin/recruitment/
| statusHistory.ts): best-effort, never throws. A failed email must never
| roll back or block the status update / notification insert it rides
| alongside — it just gets logged.
|
| TODO(candidate-settings): once Candidates/settings.tsx ships with a
| "Notification Preferences" toggle, check that preference before calling
| sendEmail() for candidate-facing sends. No opt-out exists yet, so every
| call currently sends unconditionally.
*/

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const FROM_NAME = process.env.RESEND_FROM_NAME ?? "Ozone Overseas";

interface SendEmailOptions {
  to: string;
  subject: string;
  /** Plain message text/body — gets wrapped in the standard branded template. */
  message: string;
  /** Optional CTA button shown below the message. */
  ctaLabel?: string;
  ctaUrl?: string;
}

/*
|--------------------------------------------------------------------------
| Send Email
|--------------------------------------------------------------------------
| Fire-and-forget from the caller's point of view. Returns true/false so
| callers CAN check delivery if they want to, but nothing requires it —
| same spirit as the `notifyError` logging already scattered through
| services/candidates/application.ts and services/admin/jobOrders.ts.
*/

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, message, ctaLabel, ctaUrl } = options;

  if (!resend) {
    console.error("[email] RESEND_API_KEY not set — skipping send to", to);
    return false;
  }

  if (!to) {
    console.error("[email] No recipient email — skipping send:", subject);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: renderTemplate({ subject, message, ctaLabel, ctaUrl }),
    });

    if (error) {
      console.error(`[email] Resend rejected send to ${to}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err);
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Branded HTML Template
|--------------------------------------------------------------------------
| One shared wrapper so every email looks consistent without hand-writing
| HTML at each of the 4 call sites (application.ts, statusHistory.ts,
| jobOrders.ts, employer/profile.ts). Keep this deliberately simple —
| inline styles only, since most email clients strip <style> blocks.
*/

function renderTemplate({
  subject,
  message,
  ctaLabel,
  ctaUrl,
}: {
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const button =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td style="padding: 24px 32px 8px;">
            <a href="${ctaUrl}"
               style="display:inline-block; background:#0b1f3a; color:#ffffff; text-decoration:none;
                      padding:12px 24px; border-radius:8px; font-size:14px; font-weight:600;">
              ${ctaLabel}
            </a>
          </td>
        </tr>`
      : "";

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa; padding:32px 0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e9f0;">
          <tr>
            <td style="background:#0b1f3a; padding:20px 32px;">
              <span style="color:#ffffff; font-size:16px; font-weight:700; letter-spacing:0.02em;">
                Ozone Overseas
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 4px;">
              <h1 style="margin:0; font-size:18px; color:#0b1f3a;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 4px;">
              <p style="margin:0; font-size:14px; line-height:1.6; color:#4a5568;">${message}</p>
            </td>
          </tr>
          ${button}
          <tr>
            <td style="padding:24px 32px 28px;">
              <p style="margin:0; font-size:12px; color:#9aa5b1;">
                This is an automated message from Ozone Overseas. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}
