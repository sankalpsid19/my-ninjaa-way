import nodemailer from "nodemailer";
// Resend import removed – using only Gmail SMTP

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
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: linear-gradient(135deg, #f0f4ff, #e0e7ff); color: #111827; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .logo { font-size: 28px; font-weight: 700; color: #4f46e5; text-align: center; margin-bottom: 30px; }
          h2 { font-size: 22px; color: #111827; margin-bottom: 20px; text-align: center; }
          .btn { display: inline-block; background: linear-gradient(90deg, #4f46e5, #6366f1); color: #ffffff !important; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 30px 0; text-align: center; }
          .footer { margin-top: 30px; font-size: 13px; color: #6b7280; text-align: center; }
          a { color: #4f46e5; word-break: break-all; }
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
          <p style="font-size: 12px; color: #6b7280; word-break: break-all;">Or copy and paste this link into your browser:<br><a href="${resetLink}">${resetLink}</a></p>
          <div class="footer">&copy; ${new Date().getFullYear()} My Ninjaa Way. All rights reserved.</div>
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

  // 1️⃣ Prefer Gmail / SMTP if credentials are present.
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
          // Remove any stray whitespace the user may have copied.
          pass: emailPass.replace(/\\s+/g, ""),
        },
      });

      const fromAddress =
        process.env.EMAIL_FROM ||
        process.env.GMAIL_FROM ||
        `My Ninjaa Way <mixedtantra@gmail.com>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "Reset your password - My Ninjaa Way",
        html: htmlContent,
      });

      return { success: true, messageId: info.messageId };
    } catch (smtpError: unknown) {
      console.error("⚠️ Gmail SMTP error:", smtpError);
      const msg = smtpError instanceof Error ? smtpError.message : "Failed to send via Gmail SMTP";
      throw new Error(`Gmail SMTP error: ${msg}`);
    }
  }

// Resend integration removed – using only Gmail SMTP


  // 3️⃣ No email service configured – give explicit guidance.
  throw new Error(
    "Email service not configured. Set either Gmail credentials (EMAIL_USER & EMAIL_APP_PASSWORD) " +
    "or a Resend API key (RESEND_API_KEY) with a verified FROM address (RESEND_FROM_EMAIL)."
  );
}
