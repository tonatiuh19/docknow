// Manage slips for host's marina
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
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get all slips for this marina
      const slips = await query(
        `SELECT s.*,
                COUNT(DISTINCT b.id) as total_bookings,
                COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as total_revenue
         FROM slips s
         LEFT JOIN bookings b ON s.id = b.slip_id
         WHERE s.marina_id = ?
         GROUP BY s.id
         ORDER BY s.slip_number`,
        [marinaId]
      );

      return res.status(200).json({ slips });
    }

    if (req.method === "POST") {
      const {
        marinaId,
        slip_number,
        length_meters,
        width_meters,
        depth_meters,
        price_per_day,
        has_power,
        has_water,
        power_capacity_amps,
        notes,
      } = req.body;

      if (
        !marinaId ||
        !slip_number ||
        !length_meters ||
        !width_meters ||
        !price_per_day
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify ownership
      const marinas = await query(
        "SELECT id FROM marinas WHERE id = ? AND host_id = ?",
        [marinaId, authHost.id]
      );

      if (marinas.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const result = await query(
        `INSERT INTO slips (
          marina_id, slip_number, length_meters, width_meters, depth_meters,
          price_per_day, has_power, has_water, power_capacity_amps, notes, is_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          marinaId,
          slip_number,
          length_meters,
          width_meters,
          depth_meters,
          price_per_day,
          has_power,
          has_water,
          power_capacity_amps,
          notes,
        ]
      );

      return res.status(201).json({
        message: "Slip created successfully",
        slipId: result.insertId,
      });
    }

    if (req.method === "PUT") {
      const { slipId, ...updates } = req.body;

      if (!slipId) {
        return res.status(400).json({ error: "Slip ID required" });
      }

      // Verify ownership through marina
      const slips = await query(
        `SELECT s.id FROM slips s
         INNER JOIN marinas m ON s.marina_id = m.id
         WHERE s.id = ? AND m.host_id = ?`,
        [slipId, authHost.id]
      );

      if (slips.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this slip" });
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== "marinaId") {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      if (updateFields.length > 0) {
        updateValues.push(slipId);
        await query(
          `UPDATE slips SET ${updateFields.join(", ")} WHERE id = ?`,
          updateValues
        );
      }

      return res.status(200).json({ message: "Slip updated successfully" });
    }

    if (req.method === "DELETE") {
      const { slipId } = req.query;

      if (!slipId) {
        return res.status(400).json({ error: "Slip ID required" });
      }

      // Verify ownership through marina
      const slips = await query(
        `SELECT s.id FROM slips s
         INNER JOIN marinas m ON s.marina_id = m.id
         WHERE s.id = ? AND m.host_id = ?`,
        [slipId, authHost.id]
      );

      if (slips.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this slip" });
      }

      await query("DELETE FROM slips WHERE id = ?", [slipId]);

      return res.status(200).json({ message: "Slip deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Slip management error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
