import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "My Ninjaa Way <onboarding@resend.dev>",
    to: [email],
    subject: "Reset your password - My Ninjaa Way",
    html: `
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
            <p style="font-size: 12px; color: #71717a; break-all;">Or copy and paste this link into your browser:<br><a href="${resetLink}">${resetLink}</a></p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} My Ninjaa Way. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message);
  }

  return data;
}
