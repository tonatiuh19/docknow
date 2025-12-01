// Check if guest exists by email
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";

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
    const users = await query<any[]>(
      "SELECT id, email, full_name, is_active FROM users WHERE email = ?",
      [email]
    );

    if (users.length > 0) {
      const user = users[0];
      return res.status(200).json({
        exists: true,
        userId: user.id,
        isActive: user.is_active,
      });
    }

    return res.status(200).json({
      exists: false,
    });
  } catch (error) {
    console.error("Check guest error:", error);
    return res.status(500).json({ error: "Failed to check guest" });
  }
}
