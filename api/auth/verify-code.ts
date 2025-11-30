// Verify code and login
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

async function generateToken(user: any): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

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
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    // Get user and session
    const results = await query(
      `SELECT u.id, u.email, u.full_name, u.user_type, u.profile_image_url,
              s.verification_code, s.expires_at, s.is_verified
       FROM users u
       INNER JOIN user_sessions s ON u.id = s.user_id
       WHERE u.email = ? AND u.is_active = TRUE
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [email]
    );

    if (results.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid email or no active session" });
    }

    const userData = results[0];

    // Check if code matches
    if (userData.verification_code !== code) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    // Check if expired
    if (new Date() > new Date(userData.expires_at)) {
      return res.status(401).json({ error: "Verification code has expired" });
    }

    // Check if already verified
    if (userData.is_verified) {
      return res.status(401).json({ error: "Code already used" });
    }

    // Mark session as verified
    await query(
      "UPDATE user_sessions SET is_verified = TRUE WHERE user_id = ? AND verification_code = ?",
      [userData.id, code]
    );

    // Generate JWT token
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      user_type: userData.user_type,
    };

    const token = await generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        ...user,
        profile_image_url: userData.profile_image_url,
      },
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return res.status(500).json({ error: "Failed to verify code" });
  }
}
