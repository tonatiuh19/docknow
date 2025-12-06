import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import {
  getOrCreateSession,
  trackCheckoutEvent,
} from "../lib/visitor-tracking";

async function sendBookingConfirmationEmail(
  email: string,
  userName: string,
  booking: any,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> {
  try {
    console.log("🔍 Checking environment variables:");
    console.log("   SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
    console.log("   SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
    console.log("   SMTP_USER:", process.env.SMTP_USER || "NOT SET");
    console.log(
      "   SMTP_PASSWORD:",
      process.env.SMTP_PASSWORD ? "SET (hidden)" : "NOT SET"
    );

    // Configure email transporter
    const transportConfig = {
      host: process.env.SMTP_HOST || "mail.garbrix.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    console.log("📧 Using configured SMTP settings:");
    console.log("   Host:", transportConfig.host);
    console.log("   Port:", transportConfig.port);
    console.log("   Secure:", transportConfig.secure);
    console.log("   User:", transportConfig.auth.user);

    console.log("🔧 Creating transporter...");
    const transporter = nodemailer.createTransport(transportConfig);

    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified!");

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6b7280; font-size: 14px; }
          .detail-value { font-weight: bold; color: #111827; margin-top: 5px; }
          .price-section { background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .price-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .price-total { font-size: 18px; font-weight: bold; padding-top: 10px; border-top: 2px solid #d1d5db; margin-top: 10px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0;">Your slip is secured and ready for you</p>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your booking has been confirmed and your payment has been processed successfully.</p>
            
            <div class="booking-card">
              <h2 style="margin-top: 0; color: #2563eb;">${
                booking.marina_name
              }</h2>
              <p style="color: #6b7280; margin: 5px 0;">
                ${booking.address || ""}<br>
                ${booking.city}, ${booking.state}
              </p>
              
              <div style="margin-top: 20px;">
                <div class="detail-row">
                  <div class="detail-label">Confirmation Number</div>
                  <div class="detail-value">#${booking.id}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Check-in</div>
                  <div class="detail-value">${checkInDate}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Check-out</div>
                  <div class="detail-value">${checkOutDate}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Total Nights</div>
                  <div class="detail-value">${booking.total_days} ${
      booking.total_days === 1 ? "night" : "nights"
    }</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Slip Number</div>
                  <div class="detail-value">${booking.slip_number}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Boat</div>
                  <div class="detail-value">${booking.boat_name} (${
      booking.boat_length
    }m)</div>
                </div>
              </div>
            </div>
            
            <div class="price-section">
              <div class="price-row">
                <span>Subtotal</span>
                <span>$${parseFloat(booking.subtotal).toFixed(2)}</span>
              </div>
              <div class="price-row">
                <span>Service Fee</span>
                <span>$${parseFloat(booking.service_fee).toFixed(2)}</span>
              </div>
              ${
                booking.discount_amount > 0
                  ? `
              <div class="price-row" style="color: #059669;">
                <span>Discount ${
                  booking.coupon_code ? `(${booking.coupon_code})` : ""
                }</span>
                <span>-$${parseFloat(booking.discount_amount).toFixed(2)}</span>
              </div>
              `
                  : ""
              }
              <div class="price-row price-total">
                <span>Total Paid</span>
                <span>$${parseFloat(booking.total_amount).toFixed(2)}</span>
              </div>
            </div>
            
            ${
              booking.special_requests
                ? `
            <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>Special Requests:</strong><br>
              ${booking.special_requests}
            </div>
            `
                : ""
            }
            
            <p style="margin-top: 30px;"><strong>What's Next?</strong></p>
            <ul style="color: #4b5563;">
              <li>Save this confirmation email for your records</li>
              <li>Arrive at the marina during check-in hours</li>
              <li>Present your confirmation number at the marina office</li>
              <li>Contact the marina for any questions</li>
            </ul>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              If you have any questions, please contact us at support@docknow.app
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} DockNow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("📤 Sending confirmation email to:", email);
    console.log(
      "   From field:",
      process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`
    );
    console.log("   Subject:", `Booking Confirmed - ${booking.marina_name}`);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Booking Confirmed - ${booking.marina_name}`,
      html: emailBody,
      text: `Hi ${userName},\n\nYour booking has been confirmed!\n\nConfirmation #: ${
        booking.id
      }\nMarina: ${
        booking.marina_name
      }\nCheck-in: ${checkInDate}\nCheck-out: ${checkOutDate}\nSlip: ${
        booking.slip_number
      }\nTotal: $${parseFloat(booking.total_amount).toFixed(
        2
      )}\n\nThank you,\nDockNow Team`,
    });

    console.log("✅ Confirmation email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", JSON.stringify(info.response || "No response"));
    console.log("   Accepted:", JSON.stringify(info.accepted || []));
    console.log("   Rejected:", JSON.stringify(info.rejected || []));

    return true;
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    return false;
  }
}

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
        b.subtotal,
        b.service_fee,
        b.discount_amount,
        b.status,
        b.special_requests,
        b.coupon_code,
        m.name as marina_name,
        m.slug as marina_slug,
        m.city,
        m.state,
        m.address,
        s.slip_number,
        boat.name as boat_name,
        boat.length_meters as boat_length,
        u.full_name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN marinas m ON b.marina_id = m.id
      JOIN slips s ON b.slip_id = s.id
      JOIN boats boat ON b.boat_id = boat.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookings[0];

    // Format dates for email
    const checkInDate = new Date(booking.check_in_date).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    const checkOutDate = new Date(booking.check_out_date).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    // Track booking completed (non-blocking)
    const sessionId = req.headers["x-session-id"] as string;
    if (sessionId) {
      const marinaId = await query(
        "SELECT marina_id, slip_id, user_id FROM bookings WHERE id = ?",
        [bookingId]
      );
      if (marinaId.length > 0) {
        const bookingData = marinaId[0];
        getOrCreateSession(
          sessionId,
          bookingData.user_id,
          bookingData.marina_id,
          req
        ).catch(console.error);
        trackCheckoutEvent({
          sessionId,
          userId: bookingData.user_id,
          marinaId: bookingData.marina_id,
          slipId: bookingData.slip_id || undefined,
          eventType: "booking_completed",
          checkInDate: booking.check_in_date,
          checkOutDate: booking.check_out_date,
          totalAmount: parseFloat(booking.total_amount),
          bookingId: bookingId,
        }).catch(console.error);
      }
    }

    // Send confirmation email
    console.log("📧 Attempting to send booking confirmation email...");
    const emailSent = await sendBookingConfirmationEmail(
      booking.user_email,
      booking.user_name,
      booking,
      checkInDate,
      checkOutDate
    );

    if (!emailSent) {
      console.log("⚠️  Email failed but continuing with booking confirmation");
    }

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
