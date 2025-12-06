// API: Track home page visitors
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId, deviceType, browser, os, landingPage } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Extract visitor information from headers
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      (req.headers["x-real-ip"] as string) ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers["referer"] || null;

    // Insert home visitor record
    await query(
      `INSERT INTO home_visitors 
      (session_id, ip_address, user_agent, referrer, device_type, browser, os, landing_page, visited_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        sessionId,
        ipAddress,
        userAgent,
        referrer,
        deviceType || "other",
        browser || null,
        os || null,
        landingPage || "/",
      ]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Track home visitor error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
