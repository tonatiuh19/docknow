// Get bookings for host's marinas
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
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
      const { status, marinaId, startDate, endDate } = req.query;

      let queryStr = `
        SELECT b.*, 
               m.name as marina_name, m.city as marina_city,
               s.slip_number,
               u.full_name as guest_name, u.email as guest_email, u.phone as guest_phone,
               bt.name as boat_type, bo.name as boat_name, bo.length_meters as boat_length
        FROM bookings b
        INNER JOIN marinas m ON b.marina_id = m.id
        LEFT JOIN slips s ON b.slip_id = s.id
        INNER JOIN users u ON b.user_id = u.id
        LEFT JOIN boats bo ON b.boat_id = bo.id
        LEFT JOIN boat_types bt ON bo.boat_type_id = bt.id
        WHERE m.host_id = ?
      `;

      const params: any[] = [authHost.id];

      if (status) {
        queryStr += " AND b.status = ?";
        params.push(status);
      }

      if (marinaId) {
        queryStr += " AND b.marina_id = ?";
        params.push(marinaId);
      }

      if (startDate) {
        queryStr += " AND b.check_in_date >= ?";
        params.push(startDate);
      }

      if (endDate) {
        queryStr += " AND b.check_out_date <= ?";
        params.push(endDate);
      }

      queryStr += " ORDER BY b.check_in_date DESC";

      const bookings = await query(queryStr, params);

      return res.status(200).json({ bookings });
    }

    if (req.method === "PUT") {
      const { bookingId, status, notes } = req.body;

      if (!bookingId) {
        return res.status(400).json({ error: "Booking ID required" });
      }

      // Verify ownership through marina
      const bookings = await query(
        `SELECT b.id FROM bookings b
         INNER JOIN marinas m ON b.marina_id = m.id
         WHERE b.id = ? AND m.host_id = ?`,
        [bookingId, authHost.id]
      );

      if (bookings.length === 0) {
        return res
          .status(403)
          .json({ error: "Unauthorized to update this booking" });
      }

      const updates = [];
      const values = [];

      if (status) {
        updates.push("status = ?");
        values.push(status);
      }

      if (notes !== undefined) {
        updates.push("notes = ?");
        values.push(notes);
      }

      if (updates.length > 0) {
        values.push(bookingId);
        await query(
          `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
          values
        );
      }

      return res.status(200).json({ message: "Booking updated successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Booking management error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
