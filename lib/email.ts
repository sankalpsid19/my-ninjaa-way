import nodemailer from "nodemailer";
import { Resend } from "resend";

export function getResolvedBaseUrl(customBaseUrl?: string): string {
  if (customBaseUrl) {
    return customBaseUrl.replace(/\/$/, "");
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

function getPasswordResetEmailHtml(resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e4e4e7; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 24px; text-align: center; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin: 20px 0; text-align: center; }
          .footer { margin-top: 24px; font-size: 12px; color: #71717a; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ My Ninjaa Way</div>
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>
          <p>This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #71717a; word-break: break-all;">Or copy and paste this link into your browser:<br><a href="${resetLink}">${resetLink}</a></p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} My Ninjaa Way. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  customBaseUrl?: string
) {
  const baseUrl = getResolvedBaseUrl(customBaseUrl);
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  const htmlContent = getPasswordResetEmailHtml(resetLink);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Password Reset] Reset link generated for ${email}: ${resetLink}`);
  }

  // 1. Check for Gmail / SMTP credentials (works with any recipient, zero domain verification)
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass =
    process.env.EMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser.trim(),
          // Strip whitespace if user copied Google App Password with spaces
          pass: emailPass.replace(/\s+/g, ""),
        },
      });

      const fromAddress =
        process.env.EMAIL_FROM ||
        process.env.GMAIL_FROM ||
        `"My Ninjaa Way" <${emailUser.trim()}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "Reset your password - My Ninjaa Way",
        html: htmlContent,
      });

      return { success: true, messageId: info.messageId };
    } catch (smtpError: unknown) {
      console.error("Gmail SMTP error:", smtpError);
      const message =
        smtpError instanceof Error ? smtpError.message : "Failed to send email via Gmail SMTP";
      throw new Error(`Gmail SMTP error: ${message}`);
    }
  }

  // 2. Fallback to Resend if configured
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "My Ninjaa Way <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: "Reset your password - My Ninjaa Way",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend email error:", error);
      const errorObj = error as Record<string, unknown>;
      const isTestingRestriction =
        error.message?.includes("testing emails to your own email address") ||
        errorObj?.statusCode === 403;

      if (isTestingRestriction) {
        throw new Error(
          "Email delivery restriction: Resend's default sender (onboarding@resend.dev) can only send emails to the account owner. For Vercel, please set EMAIL_USER and EMAIL_APP_PASSWORD in environment variables to use Gmail SMTP instead."
        );
      }

      throw new Error(error.message || "Failed to send password reset email via Resend.");
    }

    return data;
  }

  // 3. No email configuration found
  throw new Error(
    "Email service is not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD (for Gmail SMTP) in your Vercel environment variables."
  );
}
