import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      return res.status(400).json({
        error: "Booking ID and Payment Intent ID are required",
      });
    }

    // Update booking status to confirmed and add payment intent ID
    await query(
      `UPDATE bookings 
       SET status = 'confirmed', 
           stripe_payment_intent_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [paymentIntentId, bookingId]
    );

    // Update coupon usage count if coupon was used
    await query(
      `UPDATE coupons c
       JOIN bookings b ON c.code = b.coupon_code
       SET c.times_used = c.times_used + 1
       WHERE b.id = ? AND b.coupon_code IS NOT NULL`,
      [bookingId]
    );

    // Fetch complete booking details
    const bookings = await query(
      `SELECT 
        b.id,
        b.check_in_date,
        b.check_out_date,
        b.total_days,
        b.total_amount,
        b.status,
        b.special_requests,
        m.name as marina_name,
        m.slug as marina_slug,
        boat.name as boat_name,
        u.full_name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN marinas m ON b.marina_id = m.id
      JOIN boats boat ON b.boat_id = boat.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];

    // TODO: Send confirmation email here
    // You can use a service like SendGrid, AWS SES, or Nodemailer

    return res.status(200).json({
      success: true,
      data: booking,
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return res.status(500).json({ error: "Failed to confirm booking" });
  }
}
