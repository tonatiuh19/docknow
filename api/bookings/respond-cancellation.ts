import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
import nodemailer from "nodemailer";

async function sendCancellationStatusEmail(
  email: string,
  userName: string,
  booking: any,
  request: any,
  status: "approved" | "rejected"
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.garbrix.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.verify();

    const isApproved = status === "approved";
    const statusColor = isApproved ? "#059669" : "#dc2626";
    const statusText = isApproved ? "Approved" : "Rejected";

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6b7280; font-size: 14px; }
          .detail-value { font-weight: bold; color: #111827; margin-top: 5px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cancellation Request ${statusText}</h1>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your cancellation request for booking #${
              booking.id
            } has been <strong>${statusText.toLowerCase()}</strong> by the marina host.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #2563eb;">Booking Details</h3>
              <div class="detail-row">
                <div class="detail-label">Marina</div>
                <div class="detail-value">${booking.marina_name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Check-in Date</div>
                <div class="detail-value">${new Date(
                  booking.check_in_date
                ).toLocaleDateString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Check-out Date</div>
                <div class="detail-value">${new Date(
                  booking.check_out_date
                ).toLocaleDateString()}</div>
              </div>
              ${
                request.refund_amount
                  ? `
              <div class="detail-row">
                <div class="detail-label">Refund Amount</div>
                <div class="detail-value" style="color: #059669;">$${parseFloat(
                  request.refund_amount
                ).toFixed(2)}</div>
              </div>
              `
                  : ""
              }
            </div>
            
            ${
              request.admin_notes
                ? `
            <div style="background: #f3f4f6; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>Host's Message:</strong><br>
              ${request.admin_notes}
            </div>
            `
                : ""
            }
            
            ${
              isApproved
                ? `
              <p><strong>Next Steps:</strong></p>
              <ul style="color: #4b5563;">
                <li>Your booking has been cancelled</li>
                ${
                  request.refund_amount
                    ? "<li>Your refund will be processed within 5-7 business days</li>"
                    : ""
                }
                <li>You will receive a confirmation email shortly</li>
              </ul>
            `
                : `
              <p><strong>Your booking remains active.</strong> If you have questions about this decision, please contact the marina directly.</p>
            `
            }
            
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

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Cancellation Request ${statusText} - ${booking.marina_name}`,
      html: emailBody,
      text: `Your cancellation request for booking #${
        booking.id
      } has been ${statusText.toLowerCase()}.`,
    });

    return true;
  } catch (error) {
    console.error("Error sending cancellation status email:", error);
    return false;
  }
}

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

    const { requestId, status, adminNotes, refundAmount, refundPercentage } =
      req.body;

    if (!requestId || !status) {
      return res
        .status(400)
        .json({ error: "Request ID and status are required" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be 'approved' or 'rejected'" });
    }

    // Get the cancellation request details
    const requests = await query(
      `SELECT 
        cr.id,
        cr.booking_id,
        cr.user_id,
        cr.status AS request_status,
        cr.reason,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.status AS booking_status,
        b.marina_id,
        m.name AS marina_name,
        u.email AS user_email,
        u.full_name AS user_name
      FROM cancellation_requests cr
      JOIN bookings b ON cr.booking_id = b.id
      JOIN marinas m ON b.marina_id = m.id
      JOIN users u ON cr.user_id = u.id
      WHERE cr.id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: "Cancellation request not found" });
    }

    const request = requests[0];

    if (request.request_status !== "pending") {
      return res
        .status(400)
        .json({ error: "Request has already been processed" });
    }

    // TODO: Verify user is host/admin of the marina
    // For now, we'll assume authentication is sufficient

    // Update cancellation request
    await query(
      `UPDATE cancellation_requests
       SET status = ?,
           admin_notes = ?,
           refund_amount = ?,
           refund_percentage = ?,
           responded_at = CURRENT_TIMESTAMP,
           responded_by = ?
       WHERE id = ?`,
      [
        status,
        adminNotes || null,
        refundAmount || null,
        refundPercentage || null,
        userId,
        requestId,
      ]
    );

    // If approved, update booking status to cancelled
    if (status === "approved") {
      await query(
        `UPDATE bookings
         SET status = 'cancelled',
             cancelled_at = CURRENT_TIMESTAMP,
             cancellation_reason = ?
         WHERE id = ?`,
        [
          `Cancellation request #${requestId} approved${
            adminNotes ? ": " + adminNotes : ""
          }`,
          request.booking_id,
        ]
      );
    }

    // Send notification email to user
    const emailSent = await sendCancellationStatusEmail(
      request.user_email,
      request.user_name,
      {
        id: request.booking_id,
        marina_name: request.marina_name,
        check_in_date: request.check_in_date,
        check_out_date: request.check_out_date,
        total_amount: request.total_amount,
      },
      {
        admin_notes: adminNotes,
        refund_amount: refundAmount,
      },
      status
    );

    return res.status(200).json({
      success: true,
      message: `Cancellation request ${status} successfully`,
      emailSent,
    });
  } catch (error) {
    console.error("Error responding to cancellation request:", error);
    return res
      .status(500)
      .json({ error: "Failed to process cancellation request" });
  }
}
