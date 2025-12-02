import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const {
      userId,
      marinaId,
      boatId,
      checkIn,
      checkOut,
      couponCode,
      specialRequests,
      slipId, // Add slipId parameter
    } = req.body;

    // Validation
    if (!userId || !marinaId || !boatId || !checkIn || !checkOut) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Validate slip is available if provided
    if (slipId) {
      const slipCheck = await query(
        `SELECT s.id, s.slip_number, s.length_meters, s.is_available,
                COUNT(b.id) as booking_conflicts
         FROM slips s
         LEFT JOIN bookings b ON s.id = b.slip_id
           AND b.status IN ('confirmed', 'pending')
           AND (
             (b.check_in_date <= ? AND b.check_out_date >= ?) OR
             (b.check_in_date <= ? AND b.check_out_date >= ?) OR
             (b.check_in_date >= ? AND b.check_out_date <= ?)
           )
         WHERE s.id = ? AND s.marina_id = ?
         GROUP BY s.id
         HAVING booking_conflicts = 0`,
        [
          checkIn,
          checkIn,
          checkOut,
          checkOut,
          checkIn,
          checkOut,
          slipId,
          marinaId,
        ]
      );

      if (slipCheck.length === 0 || slipCheck[0].booking_conflicts > 0) {
        return res.status(400).json({
          error: "Selected slip is not available for the specified dates",
        });
      }
    }

    // Calculate days
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalDays = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get marina details for pricing
    const marinas = await query(
      `SELECT id, name, price_per_day FROM marinas WHERE id = ?`,
      [marinaId]
    );

    if (marinas.length === 0) {
      return res.status(404).json({ error: "Marina not found" });
    }

    const marina = marinas[0];
    const pricePerDay = parseFloat(marina.price_per_day);
    const subtotal = totalDays * pricePerDay;
    const serviceFee = subtotal * 0.1; // 10% service fee

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      const coupons = await query(
        `SELECT id, discount_type, discount_value FROM coupons 
         WHERE code = ? AND is_active = 1`,
        [couponCode]
      );

      if (coupons.length > 0) {
        const coupon = coupons[0];
        couponId = coupon.id;

        if (coupon.discount_type === "percentage") {
          discountAmount = subtotal * (parseFloat(coupon.discount_value) / 100);
        } else {
          discountAmount = parseFloat(coupon.discount_value);
        }
      }
    }

    const totalAmount = subtotal + serviceFee - discountAmount;

    // Create booking record (pending status)
    const result = await query(
      `INSERT INTO bookings (
        user_id,
        marina_id,
        slip_id,
        boat_id,
        check_in_date,
        check_out_date,
        total_days,
        price_per_day,
        subtotal,
        service_fee,
        discount_amount,
        total_amount,
        coupon_code,
        special_requests,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        marinaId,
        slipId || null,
        boatId,
        checkIn,
        checkOut,
        totalDays,
        pricePerDay,
        subtotal,
        serviceFee,
        discountAmount,
        totalAmount,
        couponCode || null,
        specialRequests || null,
      ]
    );

    const bookingId = result.insertId;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        marinaId: marinaId.toString(),
        marinaName: marina.name,
      },
      description: `Booking at ${marina.name} - ${checkIn} to ${checkOut}`,
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId,
      amount: totalAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
}
