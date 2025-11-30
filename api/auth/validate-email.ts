// Validate user email
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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
      `SELECT id, email, full_name, date_of_birth, phone, phone_code, 
              country_code, user_type, is_active, stripe_customer_id
       FROM users 
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(200).json({ exists: false, user: null });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    return res.status(200).json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Validate email error:", error);
    return res.status(500).json({ error: "Failed to validate email" });
  }
}
