import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.SMTP_FROM || "noreply@docknow.app",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export function generateVerificationCodeEmail(
  name: string,
  code: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #334e68 0%, #00c4e6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px solid #334e68; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #334e68; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to DockNow!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thanks for signing in to DockNow. Please use the verification code below to complete your login:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 DockNow LLC. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateBookingConfirmationEmail(
  name: string,
  marinaName: string,
  checkIn: string,
  checkOut: string,
  total: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #334e68 0%, #00c4e6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your booking has been confirmed. We're excited to host you!</p>
          
          <div class="booking-details">
            <h2 style="margin-top: 0;">${marinaName}</h2>
            <div class="detail-row">
              <span>Check-in:</span>
              <strong>${checkIn}</strong>
            </div>
            <div class="detail-row">
              <span>Check-out:</span>
              <strong>${checkOut}</strong>
            </div>
            <div class="detail-row total-row">
              <span>Total:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          
          <p>You can view your booking details anytime in the DockNow mobile app.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 DockNow LLC. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
