// Send verification code
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const users = await query(
      "SELECT id, full_name FROM users WHERE email = ? AND is_active = TRUE",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete old sessions
    await query("DELETE FROM user_sessions WHERE user_id = ?", [user.id]);

    // Create new session
    await query(
      `INSERT INTO user_sessions (user_id, verification_code, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, code, expiresAt]
    );

    // Send email
    await sendEmail({
      to: email,
      subject: "Your DockNow Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to DockNow!</h1>
            <p>Hi ${user.full_name},</p>
            <p>Your verification code is:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DockNow. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({
      message: "Verification code sent",
      expiresAt,
    });
  } catch (error) {
    console.error("Send code error:", error);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
}
