import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
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

    const { bookingId, reason } = req.body;

    if (!bookingId || !reason) {
      return res
        .status(400)
        .json({ error: "Booking ID and reason are required" });
    }

    // Verify booking belongs to user and can be cancelled
    const bookings = await query(
      `SELECT id, status, check_in_date 
       FROM bookings 
       WHERE id = ? AND user_id = ?`,
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ error: "Cannot cancel completed booking" });
    }

    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ error: "Only confirmed bookings can be cancelled" });
    }

    // Check if check-in date is in the past
    const checkInDate = new Date(booking.check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate <= today) {
      return res
        .status(400)
        .json({ error: "Cannot cancel bookings that have already started" });
    }

    // Check for existing pending cancellation request
    const existingRequests = await query(
      `SELECT id FROM cancellation_requests 
       WHERE booking_id = ? AND status = 'pending'`,
      [bookingId]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({
        error: "A cancellation request is already pending for this booking",
        requestId: existingRequests[0].id,
      });
    }

    // Create cancellation request
    const result = await query(
      `INSERT INTO cancellation_requests (booking_id, user_id, reason)
       VALUES (?, ?, ?)`,
      [bookingId, userId, reason]
    );

    return res.status(200).json({
      success: true,
      message:
        "Cancellation request submitted successfully. The host will review your request.",
      requestId: result.insertId,
    });
  } catch (error) {
    console.error("Error submitting cancellation request:", error);
    return res
      .status(500)
      .json({ error: "Failed to submit cancellation request" });
  }
}
