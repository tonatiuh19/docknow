import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  let userId: number;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (req.method === "GET") {
    try {
      // Get user profile
      const users = await query(
        `SELECT id, email, full_name, date_of_birth, phone, phone_code, country_code,
                profile_image_url, user_type, email_verified, general_notifications, marketing_notifications,
                created_at, updated_at
         FROM users
         WHERE id = ? AND is_active = 1`,
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: users[0],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        full_name,
        date_of_birth,
        phone,
        phone_code,
        country_code,
        profile_image_url,
        general_notifications,
        marketing_notifications,
      } = req.body;

      // Validate required fields
      if (!full_name) {
        return res.status(400).json({ error: "Full name is required" });
      }

      // Update user profile
      await query(
        `UPDATE users 
         SET full_name = ?,
             date_of_birth = ?,
             phone = ?,
             phone_code = ?,
             country_code = ?,
             profile_image_url = ?,
             general_notifications = ?,
             marketing_notifications = ?
         WHERE id = ? AND is_active = 1`,
        [
          full_name,
          date_of_birth || null,
          phone || null,
          phone_code || null,
          country_code || null,
          profile_image_url || null,
          general_notifications !== undefined ? general_notifications : 1,
          marketing_notifications !== undefined ? marketing_notifications : 1,
          userId,
        ]
      );

      // Fetch updated profile
      const users = await query(
        `SELECT id, email, full_name, date_of_birth, phone, phone_code, country_code,
                profile_image_url, user_type, email_verified, general_notifications, marketing_notifications,
                created_at, updated_at
         FROM users
         WHERE id = ?`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: users[0],
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
