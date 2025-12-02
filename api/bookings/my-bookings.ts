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
      console.log("JWT decoded successfully, userId:", userId);
    } catch (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({
        error: "Invalid token",
        details: err instanceof Error ? err.message : String(err),
      });
    }

    // Get status filter from query params
    const status = req.query.status as string | undefined;

    let whereClause = "b.user_id = ?";
    const params: any[] = [userId];

    if (
      status &&
      ["pending", "confirmed", "cancelled", "completed"].includes(status)
    ) {
      whereClause += " AND b.status = ?";
      params.push(status);
    }

    console.log("Fetching bookings for userId:", userId);
    console.log("Where clause:", whereClause);
    console.log("Params:", params);

    // Fetch user bookings with all related data
    const bookings = await query(
      `SELECT 
        b.id,
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
        b.stripe_payment_intent_id,
        b.cancelled_at,
        b.cancellation_reason,
        b.special_requests,
        b.created_at,
        b.updated_at,
        m.id as marina_id,
        m.name as marina_name,
        m.slug as marina_slug,
        m.city as marina_city,
        m.state as marina_state,
        m.address as marina_address,
        m.latitude as marina_latitude,
        m.longitude as marina_longitude,
        m.contact_phone as marina_phone,
        m.contact_email as marina_email,
        s.slip_number,
        s.length_meters as slip_length,
        s.width_meters as slip_width,
        boat.id as boat_id,
        boat.name as boat_name,
        boat.model as boat_model,
        boat.manufacturer as boat_manufacturer,
        boat.length_meters as boat_length,
        boat.width_meters as boat_width
      FROM bookings b
      JOIN marinas m ON b.marina_id = m.id
      LEFT JOIN slips s ON b.slip_id = s.id
      JOIN boats boat ON b.boat_id = boat.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC`,
      params
    );

    console.log("Query returned bookings:", bookings);
    console.log(
      "Bookings length:",
      Array.isArray(bookings) ? bookings.length : "NOT AN ARRAY"
    );

    // Ensure bookings is an array
    const bookingsArray = Array.isArray(bookings) ? bookings : [];

    // Format the response
    const formattedBookings = bookingsArray.map((booking: any) => ({
      id: booking.id,
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      totalDays: booking.total_days,
      pricePerDay: parseFloat(booking.price_per_day),
      subtotal: parseFloat(booking.subtotal),
      serviceFee: parseFloat(booking.service_fee),
      discountAmount: parseFloat(booking.discount_amount),
      totalAmount: parseFloat(booking.total_amount),
      couponCode: booking.coupon_code,
      status: booking.status,
      stripePaymentIntentId: booking.stripe_payment_intent_id,
      cancelledAt: booking.cancelled_at,
      cancellationReason: booking.cancellation_reason,
      specialRequests: booking.special_requests,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      marina: {
        id: booking.marina_id,
        name: booking.marina_name,
        slug: booking.marina_slug,
        city: booking.marina_city,
        state: booking.marina_state,
        address: booking.marina_address,
        latitude: booking.marina_latitude,
        longitude: booking.marina_longitude,
        phone: booking.marina_phone,
        email: booking.marina_email,
      },
      slip: booking.slip_number
        ? {
            number: booking.slip_number,
            length: parseFloat(booking.slip_length),
            width: parseFloat(booking.slip_width),
          }
        : null,
      boat: {
        id: booking.boat_id,
        name: booking.boat_name,
        model: booking.boat_model,
        manufacturer: booking.boat_manufacturer,
        length: parseFloat(booking.boat_length),
        width: parseFloat(booking.boat_width),
      },
    }));

    return res.status(200).json({
      success: true,
      data: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
}
