import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    switch (method) {
      case "GET":
        return await getBooking(req, res, id);
      default:
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("Booking API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getBooking(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const bookings = await query(
      `SELECT 
        b.id,
        b.user_id,
        b.marina_id,
        b.boat_id,
        b.check_in_date,
        b.check_out_date,
        b.total_days,
        b.price_per_day,
        b.subtotal,
        b.service_fee,
        b.discount_amount,
        b.total_amount,
        b.coupon_code,
        b.status,
        b.special_requests,
        b.created_at,
        b.updated_at,
        m.name as marina_name,
        m.slug as marina_slug,
        boat.name as boat_name,
        boat.model as boat_model,
        boat.manufacturer as boat_manufacturer,
        u.full_name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN marinas m ON b.marina_id = m.id
      JOIN boats boat ON b.boat_id = boat.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.status(200).json({
      success: true,
      data: bookings[0],
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ error: "Failed to fetch booking" });
  }
}
