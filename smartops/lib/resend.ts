import { Resend } from "resend";

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Sends a transactional email via Resend (free tier: 3,000/month).
 * Used for approval notifications, invoice reminders, and client comms
 * that agents draft but the CEO/system dispatches after approval.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  const from = process.env.RESEND_FROM_EMAIL || "SmartOps <noreply@smartops.app>";
  return getClient().emails.send({
    from,
    to,
    subject,
    html,
    replyTo,
  });
}

export function approvalNotificationEmail(title: string, description: string, approvalUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#4338ca;">New approval needed</h2>
      <p><strong>${title}</strong></p>
      <p style="white-space: pre-wrap; color: #374151;">${description}</p>
      <a href="${approvalUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Review in SmartOps</a>
    </div>
  `;
}
