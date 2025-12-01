// Verify guest code and create session
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

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
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: "User ID and code are required" });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Invalid code format" });
    }

    // Get session
    const sessions = await query<any[]>(
      `SELECT * FROM user_sessions 
       WHERE user_id = ? AND verification_code = ? AND is_verified = 0
       ORDER BY created_at DESC LIMIT 1`,
      [userId, code]
    );

    if (sessions.length === 0) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const session = sessions[0];

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (now > expiresAt) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Mark session as verified
    await query("UPDATE user_sessions SET is_verified = 1 WHERE id = ?", [
      session.id,
    ]);

    // Mark email as verified
    await query("UPDATE users SET email_verified = 1 WHERE id = ?", [userId]);

    // Get user data
    const users = await query<any[]>(
      `SELECT id, email, full_name, phone, phone_code, country_code, 
              date_of_birth, user_type, profile_image_url, is_active
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.user_type,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        phone_code: user.phone_code,
        country_code: user.country_code,
        date_of_birth: user.date_of_birth,
        user_type: user.user_type,
        profile_image_url: user.profile_image_url,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error("Verify guest code error:", error);
    return res.status(500).json({ error: "Failed to verify code" });
  }
}
