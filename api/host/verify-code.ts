// Verify code and login for host
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

async function generateToken(host: any): Promise<string> {
  return await new SignJWT({ host })
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

    // Get host and session
    const results = await query(
      `SELECT h.id, h.email, h.full_name, h.phone, h.phone_code, 
              h.country_code, h.profile_image_url, h.company_name,
              s.verification_code, s.expires_at, s.is_verified
       FROM hosts h
       INNER JOIN host_sessions s ON h.id = s.host_id
       WHERE h.email = ? AND h.is_active = TRUE
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [email]
    );

    if (results.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid email or no active session" });
    }

    const hostData = results[0];

    // Check if code matches
    if (hostData.verification_code !== code) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    // Check if expired
    if (new Date() > new Date(hostData.expires_at)) {
      return res.status(401).json({ error: "Verification code has expired" });
    }

    // Check if already verified
    if (hostData.is_verified) {
      return res.status(401).json({ error: "Code already used" });
    }

    // Mark session as verified
    await query(
      "UPDATE host_sessions SET is_verified = TRUE WHERE host_id = ? AND verification_code = ?",
      [hostData.id, code]
    );

    // Generate JWT token
    const host = {
      id: hostData.id,
      email: hostData.email,
      full_name: hostData.full_name,
      phone: hostData.phone,
      phone_code: hostData.phone_code,
      country_code: hostData.country_code,
      profile_image_url: hostData.profile_image_url,
      company_name: hostData.company_name,
    };

    const token = await generateToken(host);

    return res.status(200).json({
      message: "Login successful",
      token,
      host,
    });
  } catch (error) {
    console.error("Verify host code error:", error);
    return res.status(500).json({ error: "Failed to verify code" });
  }
}
