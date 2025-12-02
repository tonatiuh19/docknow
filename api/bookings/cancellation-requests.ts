import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
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

    const { bookingId } = req.query;

    // Fetch cancellation requests for user's bookings
    let sqlQuery = `
      SELECT 
        cr.id,
        cr.booking_id AS bookingId,
        cr.status,
        cr.reason,
        cr.admin_notes AS adminNotes,
        cr.refund_amount AS refundAmount,
        cr.refund_percentage AS refundPercentage,
        cr.requested_at AS requestedAt,
        cr.responded_at AS respondedAt,
        b.check_in_date AS checkInDate,
        b.check_out_date AS checkOutDate,
        b.total_amount AS totalAmount,
        b.status AS bookingStatus,
        m.name AS marinaName,
        m.slug AS marinaSlug,
        m.city AS marinaCity,
        m.state AS marinaState,
        s.slip_number AS slipNumber,
        responder.full_name AS responderName
      FROM cancellation_requests cr
      JOIN bookings b ON cr.booking_id = b.id
      JOIN marinas m ON b.marina_id = m.id
      LEFT JOIN slips s ON b.slip_id = s.id
      LEFT JOIN users responder ON cr.responded_by = responder.id
      WHERE cr.user_id = ?
    `;

    const params: any[] = [userId];

    if (bookingId) {
      sqlQuery += ` AND cr.booking_id = ?`;
      params.push(bookingId);
    }

    sqlQuery += ` ORDER BY cr.requested_at DESC`;

    const requests = await query(sqlQuery, params);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching cancellation requests:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch cancellation requests" });
  }
}
