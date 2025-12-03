// Get guests who have booked at host's marinas
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify host token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const verified = await jwtVerify(token, JWT_SECRET);
    const authHost = verified.payload.host as any;

    // Get all guests who have booked at this host's marinas
    const guests = await query(
      `SELECT DISTINCT
         u.id, u.email, u.full_name, u.phone, u.phone_code, u.country_code,
         COUNT(DISTINCT b.id) as total_bookings,
         SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as total_spent,
         MAX(b.check_in_date) as last_booking_date
       FROM users u
       INNER JOIN bookings b ON u.id = b.user_id
       INNER JOIN marinas m ON b.marina_id = m.id
       WHERE m.host_id = ?
       GROUP BY u.id
       ORDER BY last_booking_date DESC`,
      [authHost.id]
    );

    return res.status(200).json({ guests });
  } catch (error) {
    console.error("Guest management error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
