// Get current host
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
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);

    // Verify token
    const verified = await jwtVerify(token, JWT_SECRET);
    const authHost = verified.payload.host as any;

    // Get host data
    const hosts = await query(
      `SELECT id, email, full_name, phone, phone_code,
              country_code, profile_image_url, company_name,
              is_active, email_verified, created_at, updated_at
       FROM hosts
       WHERE id = ? AND is_active = TRUE`,
      [authHost.id]
    );

    if (hosts.length === 0) {
      return res.status(404).json({ error: "Host not found" });
    }

    return res.status(200).json({ host: hosts[0] });
  } catch (error) {
    console.error("Get host error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}
