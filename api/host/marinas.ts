// Get marinas for authenticated host
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

    if (req.method === "GET") {
      // Get all marinas for this host
      const marinas = await query(
        `SELECT m.*, 
                COUNT(DISTINCT s.id) as total_slips,
                COUNT(DISTINCT CASE WHEN s.is_available = 1 THEN s.id END) as available_slips,
                COUNT(DISTINCT b.id) as total_bookings,
                COALESCE(SUM(b.total_amount), 0) as total_revenue
         FROM marinas m
         LEFT JOIN slips s ON m.id = s.marina_id
         LEFT JOIN bookings b ON m.id = b.marina_id AND b.status = 'confirmed'
         WHERE m.host_id = ?
         GROUP BY m.id
         ORDER BY m.created_at DESC`,
        [authHost.id]
      );

      return res.status(200).json({ marinas });
    }

    if (req.method === "POST") {
      // Create new marina
      const {
        name,
        slug,
        description,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        phone,
        email,
        website,
      } = req.body;

      if (!name || !slug || !city || !country) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await query(
        `INSERT INTO marinas (
          host_id, name, slug, description, address, city, state, country,
          latitude, longitude, phone, email, website, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          authHost.id,
          name,
          slug,
          description,
          address,
          city,
          state,
          country,
          latitude,
          longitude,
          phone,
          email,
          website,
        ]
      );

      return res.status(201).json({
        message: "Marina created successfully",
        marinaId: result.insertId,
      });
    }

    if (req.method === "PUT") {
      // Update marina
      const { marinaId, ...updates } = req.body;

      if (!marinaId) {
        return res.status(400).json({ error: "Marina ID required" });
      }

      // Verify ownership
      const marinas = await query(
        "SELECT id FROM marinas WHERE id = ? AND host_id = ?",
        [marinaId, authHost.id]
      );

      if (marinas.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this marina" });
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      if (updateFields.length > 0) {
        updateValues.push(marinaId);
        await query(
          `UPDATE marinas SET ${updateFields.join(", ")} WHERE id = ?`,
          updateValues
        );
      }

      return res.status(200).json({ message: "Marina updated successfully" });
    }

    if (req.method === "DELETE") {
      const { marinaId } = req.query;

      if (!marinaId) {
        return res.status(400).json({ error: "Marina ID required" });
      }

      // Verify ownership
      const marinas = await query(
        "SELECT id FROM marinas WHERE id = ? AND host_id = ?",
        [marinaId, authHost.id]
      );

      if (marinas.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this marina" });
      }

      await query("UPDATE marinas SET is_active = FALSE WHERE id = ?", [
        marinaId,
      ]);

      return res
        .status(200)
        .json({ message: "Marina deactivated successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Marina management error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
