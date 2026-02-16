/**
 * DOCKNOW API - Separated Route Handlers
 * Express-based routing with proper middleware
 */

import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mysql, {
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { SignJWT, jwtVerify } from "jose";
import Stripe from "stripe";
import nodemailer from "nodemailer";

// Define custom request types
interface AuthenticatedRequest extends Request {
  authUser?: any;
  authUserId?: number;
  authHost?: any;
  authHostId?: number;
}

// ============= DATABASE CONNECTION =============
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query<T = any>(sql: string, values?: any[]): Promise<T> {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    return results as T;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// ============= JWT HELPERS =============
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

async function generateToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

async function verifyToken(token: string): Promise<any> {
  const verified = await jwtVerify(token, JWT_SECRET);
  return verified.payload;
}

// ============= STRIPE SETUP =============
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not configured");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

// =====================================================
// EMAIL HELPERS
// =====================================================

/**
 * Send guest/user verification email with code
 */
async function sendGuestVerificationEmail(
  email: string,
  code: string,
  fullName: string,
): Promise<void> {
  try {
    console.log("📧 Sending guest verification email");
    console.log("   Email:", email);
    console.log("   Name:", fullName);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("❌ SMTP credentials not configured!");
      console.log("📋 DEV MODE: Verification code:", code);
      return;
    }

    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper { max-width: 600px; margin: 0 auto; }
          .container { 
            background: white; 
            border-radius: 16px; 
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%);
            color: white; 
            padding: 40px 30px;
            text-align: center;
          }
          .logo-img {
            width: 120px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 700; 
            margin: 10px 0 5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.95;
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            color: #1e293b;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
          }
          .code-container {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 8px 32px rgba(14, 165, 233, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .code-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            margin-bottom: 15px;
          }
          .code { 
            font-size: 48px; 
            font-weight: 800; 
            color: #ffffff;
            letter-spacing: 16px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            padding: 15px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: inline-block;
          }
          .info-box {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          }
          .info-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
            font-size: 14px;
            color: #475569;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 3px solid #0ea5e9;
          }
          .info-item:last-child {
            margin-bottom: 0;
          }
          .info-icon {
            margin-right: 10px;
            font-size: 18px;
          }
          .security-note {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-top: 25px;
            font-size: 14px;
            color: #64748b;
            text-align: center;
          }
          .footer { 
            background: #f8fafc;
            color: #64748b; 
            font-size: 13px; 
            text-align: center; 
            padding: 30px;
            border-top: 1px solid #e2e8f0;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 5px;
          }
          .footer-tagline {
            color: #94a3b8;
            margin-bottom: 15px;
          }
          .footer-links {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
          }
          .footer-link {
            color: #0ea5e9;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <img src="https://garbrix.com/navios/assets/images/logo.png" alt="DockNow Logo" class="logo-img">
              <p>Verification Code</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${fullName},</div>
              <div class="message">Welcome to DockNow! To complete your login, please use the verification code below:</div>
              
              <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="code">${code}</div>
              </div>

              <div class="info-box">
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <div><strong>Valid for 15 minutes</strong><br>This code will expire soon for your security</div>
                </div>
                <div class="info-item">
                  <span class="info-icon">🔒</span>
                  <div><strong>Keep it private</strong><br>Never share this code with anyone, including DockNow staff</div>
                </div>
              </div>

              <div class="security-note">
                If you didn't request this code, please ignore this email. Your account remains secure.
              </div>
            </div>
            <div class="footer">
              <div class="footer-brand">⚓ DockNow</div>
              <div class="footer-tagline">Your trusted marina booking platform</div>
              <div>© ${new Date().getFullYear()} DockNow. All rights reserved.</div>
              <div class="footer-links">
                <a href="#" class="footer-link">Help Center</a> • 
                <a href="#" class="footer-link">Privacy Policy</a> • 
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} is your verification code - DockNow`,
      html: emailBody,
    });

    console.log("✅ Guest verification email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending guest email:", error);
    console.log("📋 DEV MODE: Verification code:", code);
    // Don't throw - allow the process to continue even if email fails
  }
}

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmationEmail(
  email: string,
  fullName: string,
  bookingDetails: {
    marinaName: string;
    checkIn: string;
    checkOut: string;
    slipNumber: string;
    totalAmount: number;
    bookingId: number;
  },
): Promise<void> {
  try {
    console.log("📧 Sending booking confirmation email");
    console.log("   Email:", email);
    console.log("   Booking ID:", bookingDetails.bookingId);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("❌ SMTP credentials not configured!");
      return;
    }

    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper { max-width: 650px; margin: 0 auto; }
          .container { 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%);
            color: white; 
            padding: 50px 40px;
            text-align: center;
            position: relative;
          }
          .success-icon {
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 50%;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 64px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            border: 3px solid rgba(255, 255, 255, 0.4);
            color: white;
            font-weight: bold;
          }
          .header h1 { 
            font-size: 36px; 
            font-weight: 800; 
            margin-bottom: 10px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .header p { 
            font-size: 18px; 
            opacity: 0.95;
            font-weight: 500;
          }
          .content { 
            padding: 45px 40px;
          }
          .greeting {
            font-size: 28px;
            color: #1e293b;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .message {
            font-size: 17px;
            color: #475569;
            margin-bottom: 35px;
            line-height: 1.7;
          }
          .booking-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 16px;
            padding: 35px;
            margin: 35px 0;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          }
          .booking-id {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 25px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .detail-value {
            font-size: 16px;
            color: #0f172a;
            font-weight: 700;
          }
          .total-row {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            margin: 25px -35px -35px;
            padding: 25px 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 0 0 14px 14px;
          }
          .total-label {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 600;
          }
          .total-value {
            font-size: 32px;
            color: white;
            font-weight: 800;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 35px 0;
          }
          .feature-card {
            text-align: center;
            padding: 25px 20px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            border: 2px solid #fbbf24;
            transition: transform 0.2s;
          }
          .feature-icon {
            font-size: 36px;
            margin-bottom: 12px;
          }
          .feature-title {
            font-size: 14px;
            font-weight: 700;
            color: #78350f;
          }
          .cta-button {
            display: block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
            transition: transform 0.2s;
          }
          .support-box {
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
            text-align: center;
          }
          .support-text {
            font-size: 14px;
            color: #166534;
            margin-bottom: 15px;
          }
          .footer { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #64748b; 
            font-size: 13px; 
            text-align: center; 
            padding: 35px 40px;
            border-top: 2px solid #e2e8f0;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 8px;
          }
          .footer-tagline {
            color: #94a3b8;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .footer-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .footer-link {
            color: #10b981;
            text-decoration: none;
            margin: 0 12px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <div class="success-icon">✓</div>
              <h1>Booking Confirmed!</h1>
              <p>Your slip has been successfully reserved</p>
            </div>
            <div class="content">
              <div class="greeting">Hey ${fullName}! 🎉</div>
              <div class="message">
                Great news! Your booking at <strong>${bookingDetails.marinaName}</strong> has been confirmed. 
                Get ready for an amazing experience on the water!
              </div>
              
              <div class="booking-card">
                <span class="booking-id">BOOKING #${bookingDetails.bookingId}</span>
                
                <div class="detail-row">
                  <div class="detail-label">⚓ Marina</div>
                  <div class="detail-value">${bookingDetails.marinaName}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">📍 Slip Number</div>
                  <div class="detail-value">#${bookingDetails.slipNumber}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">📅 Check-In</div>
                  <div class="detail-value">${new Date(bookingDetails.checkIn).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">📅 Check-Out</div>
                  <div class="detail-value">${new Date(bookingDetails.checkOut).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                </div>

                <div class="total-row">
                  <div class="total-label">Total Amount</div>
                  <div class="total-value">$${bookingDetails.totalAmount.toFixed(2)}</div>
                </div>
              </div>

              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-icon">📱</div>
                  <div class="feature-title">Manage Online</div>
                </div>
                <div class="feature-card">
                  <div class="feature-icon">🔔</div>
                  <div class="feature-title">Get Updates</div>
                </div>
                <div class="feature-card">
                  <div class="feature-icon">💬</div>
                  <div class="feature-title">24/7 Support</div>
                </div>
              </div>

              <a href="#" class="cta-button">View Booking Details</a>

              <div class="support-box">
                <div class="support-text"><strong>Need Help?</strong> Our support team is here for you!</div>
                <div class="support-text">📧 support@docknow.com • 📞 1-800-DOCKNOW</div>
              </div>
            </div>
            <div class="footer">
              <div class="footer-brand">⚓ DockNow</div>
              <div class="footer-tagline">Your trusted marina booking platform</div>
              <div>© ${new Date().getFullYear()} DockNow. All rights reserved.</div>
              <div class="footer-links">
                <a href="#" class="footer-link">My Bookings</a> • 
                <a href="#" class="footer-link">Help Center</a> • 
                <a href="#" class="footer-link">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎉 Booking Confirmed - ${bookingDetails.marinaName} | DockNow`,
      html: emailBody,
    });

    console.log("✅ Booking confirmation email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error);
    // Don't throw - allow the process to continue even if email fails
  }
}

/**
 * Send host verification email with code
 */
async function sendHostVerificationEmail(
  email: string,
  code: string,
  fullName: string,
): Promise<void> {
  try {
    console.log("📧 Sending host verification email");
    console.log("   Email:", email);
    console.log("   Name:", fullName);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("❌ SMTP credentials not configured!");
      console.log("📋 DEV MODE: Verification code:", code);
      return;
    }

    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper { max-width: 600px; margin: 0 auto; }
          .container { 
            background: white; 
            border-radius: 16px; 
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 50%, #4c1d95 100%);
            color: white; 
            padding: 40px 30px;
            text-align: center;
          }
          .logo-img {
            width: 120px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.25);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 10px;
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 700; 
            margin: 10px 0 5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.95;
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 24px;
            color: #1e293b;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
          }
          .code-container {
            background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 8px 32px rgba(139, 92, 246, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .code-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            margin-bottom: 15px;
          }
          .code { 
            font-size: 48px; 
            font-weight: 800; 
            color: #ffffff;
            letter-spacing: 16px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            padding: 15px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: inline-block;
          }
          .info-box {
            background: #faf5ff;
            border: 2px solid #e9d5ff;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
          }
          .info-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
            font-size: 14px;
            color: #475569;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 3px solid #8b5cf6;
          }
          .info-item:last-child {
            margin-bottom: 0;
          }
          .info-icon {
            margin-right: 10px;
            font-size: 18px;
          }
          .features {
            display: flex;
            gap: 15px;
            margin: 30px 0;
          }
          .feature {
            flex: 1;
            text-align: center;
            padding: 20px 15px;
            background: #faf5ff;
            border-radius: 10px;
            border: 1px solid #e9d5ff;
          }
          .feature-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          .feature-title {
            font-size: 13px;
            font-weight: 600;
            color: #6d28d9;
          }
          .security-note {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-top: 25px;
            font-size: 14px;
            color: #64748b;
            text-align: center;
          }
          .footer { 
            background: #faf5ff;
            color: #64748b; 
            font-size: 13px; 
            text-align: center; 
            padding: 30px;
            border-top: 1px solid #e9d5ff;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 600;
            color: #8b5cf6;
            margin-bottom: 5px;
          }
          .footer-tagline {
            color: #94a3b8;
            margin-bottom: 15px;
          }
          .footer-links {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e9d5ff;
          }
          .footer-link {
            color: #8b5cf6;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <img src="https://garbrix.com/navios/assets/images/logo.png" alt="DockNow Logo" class="logo-img">
              <p>Host Management Portal</p>
              <span class="badge">🛡️ Secure Access</span>
            </div>
            <div class="content">
              <div class="greeting">Hello ${fullName},</div>
              <div class="message">Welcome back to your DockNow Host Portal! Please use the verification code below to access your dashboard:</div>
              
              <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="code">${code}</div>
              </div>

              <div class="features">
                <div class="feature">
                  <div class="feature-icon">📊</div>
                  <div class="feature-title">Manage Bookings</div>
                </div>
                <div class="feature">
                  <div class="feature-icon">💰</div>
                  <div class="feature-title">Track Revenue</div>
                </div>
                <div class="feature">
                  <div class="feature-icon">👥</div>
                  <div class="feature-title">View Guests</div>
                </div>
              </div>

              <div class="info-box">
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <div><strong>Valid for 15 minutes</strong><br>This code will expire soon for your security</div>
                </div>
                <div class="info-item">
                  <span class="info-icon">🔒</span>
                  <div><strong>Host Account Protected</strong><br>Never share this code with anyone</div>
                </div>
              </div>

              <div class="security-note">
                If you didn't request this code, please contact our support team immediately.
              </div>
            </div>
            <div class="footer">
              <div class="footer-brand">⚓ DockNow Host Portal</div>
              <div class="footer-tagline">Professional marina management tools</div>
              <div>© ${new Date().getFullYear()} DockNow. All rights reserved.</div>
              <div class="footer-links">
                <a href="#" class="footer-link">Host Support</a> • 
                <a href="#" class="footer-link">Resources</a> • 
                <a href="#" class="footer-link">Host Agreement</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || `"DockNow Host" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} is your verification code - DockNow Host`,
      html: emailBody,
    });

    console.log("✅ Host verification email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending host email:", error);
    console.log("📋 DEV MODE: Verification code:", code);
    // Don't throw - allow the process to continue even if email fails
  }
}

// =====================================================
// MIDDLEWARE
// =====================================================

/**
 * Middleware to verify user (guest/client) session
 */
const verifyUserSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await verifyToken(token);
      const authUser = decoded.user as any;

      // Get user details
      const users = await query<RowDataPacket[]>(
        "SELECT * FROM users WHERE id = ? AND is_active = TRUE",
        [authUser.id],
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive",
        });
      }

      // Attach user info to request
      (req as any).authUser = users[0];
      (req as any).authUserId = authUser.id;

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }
  } catch (error) {
    console.error("Error verifying user session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify session",
    });
  }
};

/**
 * Middleware to verify host session
 */
const verifyHostSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await verifyToken(token);
      const authHost = decoded.host as any;

      // Get host details
      const hosts = await query<RowDataPacket[]>(
        "SELECT * FROM hosts WHERE id = ? AND is_active = TRUE",
        [authHost.id],
      );

      if (hosts.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Host not found or inactive",
        });
      }

      // Attach host info to request
      (req as any).authHost = hosts[0];
      (req as any).authHostId = authHost.id;

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }
  } catch (error) {
    console.error("Error verifying host session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify session",
    });
  }
};

/**
 * Middleware to verify guest session
 */
const verifyGuestSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No session token provided",
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await verifyToken(token);
      const authUser = decoded.user as any;

      // Get user details
      const users = await query<RowDataPacket[]>(
        "SELECT * FROM users WHERE id = ?",
        [authUser.id],
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user info to request
      (req as any).authUser = users[0];
      (req as any).authUserId = authUser.id;

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }
  } catch (error) {
    console.error("Error verifying guest session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify session",
    });
  }
};

// =====================================================
// ROUTE HANDLERS
// =====================================================

/**
 * GET /api/health
 * Health check endpoint
 */
const handleHealth = async (_req: Request, res: Response) => {
  try {
    await query("SELECT 1");
    res.json({
      success: true,
      message: "DockNow API is running",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/ping
 * Simple ping endpoint
 */
const handlePing = (_req: Request, res: Response) => {
  res.json({ message: "pong" });
};

// =====================================================
// AUTH ROUTES
// =====================================================

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const handleAuthMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).authUserId;
    const users = await query<RowDataPacket[]>(
      `SELECT id, email, full_name, date_of_birth, phone, phone_code,
              country_code, profile_image_url, user_type, stripe_customer_id,
              general_notifications, marketing_notifications,
              created_at, updated_at
       FROM users WHERE id = ? AND is_active = TRUE`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
};

/**
 * POST /api/auth/verify-code
 * Verify authentication code
 */
const handleVerifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, error: "Email and code are required" });
    }

    const results = await query<RowDataPacket[]>(
      `SELECT u.id, u.email, u.full_name, u.user_type, u.profile_image_url,
              s.verification_code, s.expires_at, s.is_verified
       FROM users u
       INNER JOIN user_sessions s ON u.id = s.user_id
       WHERE u.email = ? AND u.is_active = TRUE
       ORDER BY s.created_at DESC LIMIT 1`,
      [email],
    );

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or no active session" });
    }

    const userData = results[0];

    if (userData.verification_code !== code) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid verification code" });
    }

    if (new Date() > new Date(userData.expires_at)) {
      return res
        .status(401)
        .json({ success: false, error: "Verification code has expired" });
    }

    if (userData.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Code already used" });
    }

    await query(
      "UPDATE user_sessions SET is_verified = TRUE WHERE user_id = ? AND verification_code = ?",
      [userData.id, code],
    );

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      user_type: userData.user_type,
    };

    const token = await generateToken({ user });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { ...user, profile_image_url: userData.profile_image_url },
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ success: false, error: "Failed to verify code" });
  }
};

/**
 * POST /api/auth/check-guest
 * Check if guest user exists
 */
const handleCheckGuest = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    const users = await query<RowDataPacket[]>(
      "SELECT id, email FROM users WHERE email = ? AND is_active = TRUE",
      [email],
    );

    if (users.length > 0) {
      return res.json({ success: true, exists: true, userId: users[0].id });
    }

    res.json({ success: true, exists: false });
  } catch (error) {
    console.error("Error checking guest:", error);
    res.status(500).json({ success: false, error: "Failed to check guest" });
  }
};

/**
 * POST /api/auth/register-guest
 * Register new guest user
 */
const handleRegisterGuest = async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone, phoneCode, countryCode, dateOfBirth } =
      req.body;

    if (!email || !fullName) {
      return res
        .status(400)
        .json({ success: false, error: "Email and full name are required" });
    }

    // Validate date of birth (must be 18+)
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({
          success: false,
          error: "You must be at least 18 years old to register",
        });
      }
    }

    // Validate phone code format
    if (phoneCode && !phoneCode.startsWith("+")) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid phone code format" });
    }

    // Validate country code format (2-3 letters)
    if (countryCode && (countryCode.length < 2 || countryCode.length > 3)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid country code format" });
    }

    const existingUsers = await query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "Email already registered" });
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO users (email, full_name, phone, phone_code, country_code, date_of_birth, user_type, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'guest', TRUE, NOW(), NOW())`,
      [
        email,
        fullName,
        phone || null,
        phoneCode || null,
        countryCode || null,
        dateOfBirth || null,
      ],
    );

    const userId = result.insertId;

    res.status(201).json({ success: true, userId });
  } catch (error) {
    console.error("Error registering guest:", error);
    res.status(500).json({ success: false, error: "Failed to register guest" });
  }
};

/**
 * POST /api/auth/send-guest-code
 * Send verification code to guest
 */
const handleSendGuestCode = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res
        .status(400)
        .json({ success: false, error: "User ID and email are required" });
    }

    // Get user details for personalized email
    const users = await query<RowDataPacket[]>(
      "SELECT full_name FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `INSERT INTO user_sessions (user_id, verification_code, expires_at, is_verified, created_at)
       VALUES (?, ?, ?, FALSE, NOW())`,
      [userId, verificationCode, expiresAt],
    );

    console.log(`Verification code for ${email}: ${verificationCode}`);

    // Send verification email
    await sendGuestVerificationEmail(
      email,
      verificationCode,
      users[0].full_name || "Guest",
    );

    res.json({
      success: true,
      message: "Verification code sent",
      debug_code:
        process.env.NODE_ENV === "development" ? verificationCode : undefined,
    });
  } catch (error) {
    console.error("Error sending guest code:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send verification code" });
  }
};

/**
 * POST /api/auth/verify-guest-code
 * Verify guest verification code
 */
const handleVerifyGuestCode = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res
        .status(400)
        .json({ success: false, error: "User ID and code are required" });
    }

    const sessions = await query<RowDataPacket[]>(
      `SELECT id, verification_code, expires_at, is_verified
       FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );

    if (sessions.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "No session found" });
    }

    const session = sessions[0];

    if (session.verification_code !== code) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid verification code" });
    }

    if (new Date() > new Date(session.expires_at)) {
      return res
        .status(401)
        .json({ success: false, error: "Code has expired" });
    }

    if (session.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Code already used" });
    }

    await query("UPDATE user_sessions SET is_verified = TRUE WHERE id = ?", [
      session.id,
    ]);

    const users = await query<RowDataPacket[]>(
      "SELECT id, email, full_name, user_type, profile_image_url FROM users WHERE id = ?",
      [userId],
    );

    const user = users[0];
    const token = await generateToken({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        user_type: user.user_type,
      },
    });

    res.json({ success: true, token, user });
  } catch (error) {
    console.error("Error verifying guest code:", error);
    res.status(500).json({ success: false, error: "Failed to verify code" });
  }
};

// =====================================================
// HOST AUTH ROUTES
// =====================================================

/**
 * POST /api/host/send-code
 * Send verification code to host
 */
const handleHostSendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });

    const hosts = await query<RowDataPacket[]>(
      "SELECT id, email, full_name FROM hosts WHERE email = ? AND is_active = TRUE",
      [email],
    );

    if (hosts.length === 0) {
      return res.status(404).json({ success: false, error: "Host not found" });
    }

    const host = hosts[0];
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `INSERT INTO host_sessions (host_id, verification_code, expires_at, is_verified, created_at)
       VALUES (?, ?, ?, FALSE, NOW())`,
      [host.id, verificationCode, expiresAt],
    );

    console.log(`Host verification code for ${email}: ${verificationCode}`);

    // Send verification email
    await sendHostVerificationEmail(
      email,
      verificationCode,
      host.full_name || "Host",
    );

    res.json({
      success: true,
      message: "Verification code sent",
      debug_code:
        process.env.NODE_ENV === "development" ? verificationCode : undefined,
    });
  } catch (error) {
    console.error("Error sending host code:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send verification code" });
  }
};

/**
 * POST /api/host/verify-code
 * Verify host code and create session
 */
const handleHostVerifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, error: "Email and code are required" });
    }

    const results = await query<RowDataPacket[]>(
      `SELECT h.id, h.email, h.full_name, h.company_name, h.profile_image_url,
              s.verification_code, s.expires_at, s.is_verified
       FROM hosts h
       INNER JOIN host_sessions s ON h.id = s.host_id
       WHERE h.email = ? AND h.is_active = TRUE
       ORDER BY s.created_at DESC LIMIT 1`,
      [email],
    );

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or no active session" });
    }

    const hostData = results[0];

    if (hostData.verification_code !== code) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid verification code" });
    }

    if (new Date() > new Date(hostData.expires_at)) {
      return res
        .status(401)
        .json({ success: false, error: "Verification code has expired" });
    }

    if (hostData.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Code already used" });
    }

    await query(
      "UPDATE host_sessions SET is_verified = TRUE WHERE host_id = ? AND verification_code = ?",
      [hostData.id, code],
    );

    const host = {
      id: hostData.id,
      email: hostData.email,
      full_name: hostData.full_name,
      company_name: hostData.company_name,
    };

    const token = await generateToken({ host });

    res.json({
      success: true,
      message: "Login successful",
      token,
      host: { ...host, profile_image_url: hostData.profile_image_url },
    });
  } catch (error) {
    console.error("Error verifying host code:", error);
    res.status(500).json({ success: false, error: "Failed to verify code" });
  }
};

/**
 * GET /api/host/me
 * Get current authenticated host
 */
const handleHostMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;
    const hosts = await query<RowDataPacket[]>(
      `SELECT id, email, full_name, phone, phone_code, country_code,
              profile_image_url, company_name, is_active, email_verified,
              created_at, updated_at
       FROM hosts WHERE id = ? AND is_active = TRUE`,
      [hostId],
    );

    if (hosts.length === 0) {
      return res.status(404).json({ success: false, error: "Host not found" });
    }

    res.json({ success: true, host: hosts[0] });
  } catch (error) {
    console.error("Error fetching host:", error);
    res.status(500).json({ success: false, error: "Failed to fetch host" });
  }
};

// =====================================================
// HOST MANAGEMENT ROUTES
// =====================================================

/**
 * GET /api/host/bookings
 * Get all bookings for host's marinas
 */
const handleHostBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;
    const { status, marinaId, startDate, endDate } = req.query;

    let queryStr = `
      SELECT b.*, 
             m.name as marina_name, m.city as marina_city,
             s.slip_number,
             u.full_name as guest_name, u.email as guest_email, u.phone as guest_phone,
             bt.name as boat_type, bo.name as boat_name, bo.length_meters as boat_length,
             b.pre_checkout_completed,
             b.pre_checkout_completed_at,
             b.requires_approval,
             b.approved_at,
             COUNT(DISTINCT gss.id) as total_submissions,
             COUNT(DISTINCT CASE WHEN gss.is_completed = 1 THEN gss.id END) as completed_submissions
      FROM bookings b
      INNER JOIN marinas m ON b.marina_id = m.id
      LEFT JOIN slips s ON b.slip_id = s.id
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN boats bo ON b.boat_id = bo.id
      LEFT JOIN boat_types bt ON bo.boat_type_id = bt.id
      LEFT JOIN guest_step_submissions gss ON b.id = gss.booking_id
      WHERE m.host_id = ?
    `;
    const params: any[] = [hostId];

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

    queryStr += " GROUP BY b.id ORDER BY b.check_in_date DESC";

    const bookings = await query(queryStr, params);

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

/**
 * GET /api/host/marinas
 * Get all marinas for host
 */
const handleHostMarinas = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;

    const marinas = await query<RowDataPacket[]>(
      `SELECT m.*, bt.name as business_type_name,
       (SELECT COUNT(*) FROM slips WHERE marina_id = m.id) as total_slips,
       (SELECT COUNT(*) FROM slips WHERE marina_id = m.id AND is_available = TRUE) as available_slips
       FROM marinas m
       LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
       WHERE m.host_id = ?
       ORDER BY m.created_at DESC`,
      [hostId],
    );

    res.json({ success: true, marinas });
  } catch (error) {
    console.error("Error fetching marinas:", error);
    res.status(500).json({ success: false, error: "Failed to fetch marinas" });
  }
};

/**
 * GET /api/host/slips
 * Get slips for host's marinas
 */
const handleHostSlips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;
    const { marinaId } = req.query;

    let queryStr = `
      SELECT s.*, m.name as marina_name
      FROM slips s
      INNER JOIN marinas m ON s.marina_id = m.id
      WHERE m.host_id = ?
    `;
    const params: any[] = [hostId];

    if (marinaId) {
      queryStr += " AND s.marina_id = ?";
      params.push(marinaId);
    }

    queryStr += " ORDER BY m.name, s.slip_number";

    const slips = await query(queryStr, params);

    res.json({ success: true, slips });
  } catch (error) {
    console.error("Error fetching slips:", error);
    res.status(500).json({ success: false, error: "Failed to fetch slips" });
  }
};

/**
 * GET /api/host/guests
 * Get all guests who have booked at host's marinas
 */
const handleHostGuests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;

    const guests = await query<RowDataPacket[]>(
      `SELECT DISTINCT u.id, u.email, u.full_name, u.phone, u.created_at,
       COUNT(DISTINCT b.id) as total_bookings
       FROM users u
       INNER JOIN bookings b ON u.id = b.user_id
       INNER JOIN marinas m ON b.marina_id = m.id
       WHERE m.host_id = ?
       GROUP BY u.id
       ORDER BY u.full_name`,
      [hostId],
    );

    res.json({ success: true, guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ success: false, error: "Failed to fetch guests" });
  }
};

/**
 * GET /api/host/payments
 * Get payment information for host
 */
const handleHostPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;

    const payments = await query<RowDataPacket[]>(
      `SELECT b.id as booking_id, b.total_amount, b.created_at as booking_date,
       b.status, m.name as marina_name, u.full_name as guest_name
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       INNER JOIN users u ON b.user_id = u.id
       WHERE m.host_id = ? AND b.status IN ('confirmed', 'completed')
       ORDER BY b.created_at DESC`,
      [hostId],
    );

    const totals = await query<RowDataPacket[]>(
      `SELECT 
       SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as pending_payout,
       SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END) as total_earned
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       WHERE m.host_id = ?`,
      [hostId],
    );

    res.json({ success: true, payments, totals: totals[0] || {} });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
};

/**
 * GET /api/host/pre-checkout-steps
 * Get pre-checkout steps for host's marinas
 */
const handleHostPreCheckoutSteps = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { marinaId } = req.query;

    let queryStr = `
      SELECT pcs.*, m.name as marina_name,
      (SELECT COUNT(*) FROM pre_checkout_step_fields WHERE step_id = pcs.id) as field_count
      FROM marina_pre_checkout_steps pcs
      INNER JOIN marinas m ON pcs.marina_id = m.id
      WHERE m.host_id = ?
    `;
    const params: any[] = [hostId];

    if (marinaId) {
      queryStr += " AND pcs.marina_id = ?";
      params.push(marinaId);
    }

    queryStr += " ORDER BY pcs.step_order";

    const steps = await query(queryStr, params);

    res.json({ success: true, steps });
  } catch (error) {
    console.error("Error fetching pre-checkout steps:", error);
    res.status(500).json({ success: false, error: "Failed to fetch steps" });
  }
};

/**
 * POST /api/host/pre-checkout-steps
 * Create a new pre-checkout step
 */
const handleCreatePreCheckoutStep = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { marina_id, name, description, step_order, is_required } = req.body;

    const result = await query<ResultSetHeader>(
      `INSERT INTO marina_pre_checkout_steps (marina_id, title, description, step_order, is_required, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [marina_id, name, description, step_order || 1, is_required !== false],
    );

    res.status(201).json({ success: true, stepId: result.insertId });
  } catch (error) {
    console.error("Error creating pre-checkout step:", error);
    res.status(500).json({ success: false, error: "Failed to create step" });
  }
};

/**
 * GET /api/host/submissions
 * Get guest submissions for pre-checkout steps
 */
const handleHostSubmissions = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { bookingId } = req.query;

    let queryStr = `
      SELECT gss.*, pcs.title as step_name, u.full_name as guest_name
      FROM guest_step_submissions gss
      INNER JOIN marina_pre_checkout_steps pcs ON gss.step_id = pcs.id
      INNER JOIN bookings b ON gss.booking_id = b.id
      INNER JOIN marinas m ON b.marina_id = m.id
      INNER JOIN users u ON gss.user_id = u.id
      WHERE m.host_id = ?
    `;
    const params: any[] = [hostId];

    if (bookingId) {
      queryStr += " AND gss.booking_id = ?";
      params.push(bookingId);
    }

    queryStr += " ORDER BY gss.created_at DESC";

    const submissions = await query(queryStr, params);

    res.json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch submissions" });
  }
};

/**
 * POST /api/host/approve-booking
 * Approve or reject a booking
 */
const handleApproveBooking = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { bookingId, action, notes } = req.body;

    const bookings = await query<RowDataPacket[]>(
      `SELECT b.id FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       WHERE b.id = ? AND m.host_id = ?`,
      [bookingId, hostId],
    );

    if (bookings.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (action === "approve") {
      await query(
        `UPDATE bookings SET status = 'confirmed', approved_at = NOW() WHERE id = ?`,
        [bookingId],
      );
    } else if (action === "reject") {
      await query(
        `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = ? WHERE id = ?`,
        [notes || "Rejected by host", bookingId],
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error approving booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to approve booking" });
  }
};

/**
 * GET /api/host/visitor-analytics
 * Get visitor analytics for host's marinas
 */
const handleHostVisitorAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { period = "30" } = req.query;

    const analytics = await query<RowDataPacket[]>(
      `SELECT 
       DATE(created_at) as date,
       COUNT(*) as views,
       COUNT(DISTINCT session_id) as unique_visitors
       FROM visitor_page_views vp
       INNER JOIN marinas m ON vp.marina_id = m.id
       WHERE m.host_id = ? AND vp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [hostId, parseInt(period as string)],
    );

    res.json({ success: true, analytics });
  } catch (error) {
    console.error("Error fetching visitor analytics:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch analytics" });
  }
};

// =====================================================
// MARINA ROUTES
// =====================================================

// =====================================================
// FAQ & SUPPORT TICKET HANDLERS
// =====================================================

/**
 * GET /api/faq/categories
 * Get all FAQ categories with question count
 */
const handleGetFAQCategories = async (req: Request, res: Response) => {
  try {
    const categories = await query<RowDataPacket[]>(
      `SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon,
        c.order_index,
        COUNT(q.id) as question_count
      FROM faq_categories c
      LEFT JOIN faq_questions q ON c.id = q.category_id AND q.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.order_index ASC`,
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching FAQ categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ categories",
    });
  }
};

/**
 * GET /api/faq/questions
 * Get FAQ questions, optionally filtered by category
 */
const handleGetFAQQuestions = async (req: Request, res: Response) => {
  try {
    const { category, featured, search } = req.query;

    let sql = `
      SELECT 
        q.id,
        q.question,
        q.answer,
        q.slug,
        q.views_count,
        q.helpful_count,
        q.not_helpful_count,
        q.is_featured,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM faq_questions q
      INNER JOIN faq_categories c ON q.category_id = c.id
      WHERE q.is_active = 1 AND c.is_active = 1
    `;

    const params: any[] = [];

    if (category) {
      sql += " AND c.slug = ?";
      params.push(category);
    }

    if (featured === "true") {
      sql += " AND q.is_featured = 1";
    }

    if (search) {
      sql += " AND (q.question LIKE ? OR q.answer LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY q.order_index ASC, q.created_at DESC";

    const questions = await query<RowDataPacket[]>(sql, params);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching FAQ questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ questions",
    });
  }
};

/**
 * GET /api/faq/questions/:slug
 * Get a single FAQ question by slug
 */
const handleGetFAQQuestion = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const questions = await query<RowDataPacket[]>(
      `SELECT 
        q.id,
        q.question,
        q.answer,
        q.slug,
        q.views_count,
        q.helpful_count,
        q.not_helpful_count,
        q.is_featured,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon
      FROM faq_questions q
      INNER JOIN faq_categories c ON q.category_id = c.id
      WHERE q.slug = ? AND q.is_active = 1`,
      [slug],
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "FAQ question not found",
      });
    }

    // Increment view count
    await query(
      "UPDATE faq_questions SET views_count = views_count + 1 WHERE id = ?",
      [questions[0].id],
    );

    res.json({
      success: true,
      data: questions[0],
    });
  } catch (error) {
    console.error("Error fetching FAQ question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ question",
    });
  }
};

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
const handleCreateSupportTicket = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      category,
      priority,
      message,
      bookingId,
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, category, and message are required",
      });
    }

    // Generate unique ticket number
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Get user ID if logged in
    const authUser = (req as AuthenticatedRequest).authUser;
    const userId = authUser?.id || null;

    // Insert ticket
    const result = await query<ResultSetHeader>(
      `INSERT INTO support_tickets 
        (ticket_number, user_id, name, email, phone, subject, category, priority, status, message, booking_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, NOW(), NOW())`,
      [
        ticketNumber,
        userId,
        name,
        email,
        phone || null,
        subject,
        category,
        priority || "medium",
        message,
        bookingId || null,
      ],
    );

    const ticketId = result.insertId;

    // Insert initial message
    await query(
      `INSERT INTO support_ticket_messages 
        (ticket_id, sender_type, sender_name, message, created_at)
       VALUES (?, 'user', ?, ?, NOW())`,
      [ticketId, name, message],
    );

    // Send confirmation email
    try {
      await sendSupportTicketConfirmationEmail(
        email,
        name,
        ticketNumber,
        subject,
        message,
      );
    } catch (emailError) {
      console.error("Failed to send ticket confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      data: {
        ticketId,
        ticketNumber,
        message:
          "Support ticket created successfully. We'll respond within 24 hours.",
      },
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
  }
};

/**
 * GET /api/support/tickets/my-tickets
 * Get all tickets for the authenticated user
 */
const handleGetMyTickets = async (req: Request, res: Response) => {
  try {
    const authUser = (req as AuthenticatedRequest).authUser;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tickets = await query<RowDataPacket[]>(
      `SELECT 
        id,
        ticket_number,
        subject,
        category,
        priority,
        status,
        created_at,
        updated_at,
        resolved_at
      FROM support_tickets
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [authUser.id],
    );

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};

/**
 * GET /api/support/tickets/:ticketNumber
 * Get a specific ticket by ticket number
 */
const handleGetTicketDetails = async (req: Request, res: Response) => {
  try {
    const { ticketNumber } = req.params;
    const authUser = (req as AuthenticatedRequest).authUser;

    // Get ticket
    const tickets = await query<RowDataPacket[]>(
      `SELECT 
        t.*,
        b.booking_number
      FROM support_tickets t
      LEFT JOIN bookings b ON t.booking_id = b.id
      WHERE t.ticket_number = ?`,
      [ticketNumber],
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];

    // Verify ownership if user is logged in
    if (authUser && ticket.user_id !== authUser.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get ticket messages
    const messages = await query<RowDataPacket[]>(
      `SELECT 
        id,
        sender_type,
        sender_name,
        message,
        is_internal_note,
        created_at
      FROM support_ticket_messages
      WHERE ticket_id = ? AND is_internal_note = 0
      ORDER BY created_at ASC`,
      [ticket.id],
    );

    res.json({
      success: true,
      data: {
        ...ticket,
        messages,
      },
    });
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket details",
    });
  }
};

/**
 * Send support ticket confirmation email
 */
async function sendSupportTicketConfirmationEmail(
  email: string,
  name: string,
  ticketNumber: string,
  subject: string,
  message: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const emailBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .ticket-box { background: white; border: 2px dashed #0891b2; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .ticket-number { font-size: 24px; font-weight: bold; color: #0891b2; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 Support Ticket Received</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for contacting DockNow support. We've received your support ticket and our team will respond within 24 hours.</p>
          
          <div class="ticket-box">
            <div style="color: #6b7280; font-size: 14px;">Your Ticket Number</div>
            <div class="ticket-number">${ticketNumber}</div>
            <div style="color: #6b7280; font-size: 12px; margin-top: 10px;">Please reference this number in any future correspondence</div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 0;"><strong>Your Message:</strong></p>
            <p style="margin: 10px 0 0 0; color: #6b7280;">${message}</p>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul style="color: #6b7280;">
            <li>Our support team will review your ticket</li>
            <li>You'll receive a response via email within 24 hours</li>
            <li>For urgent issues, you can reply to this email</li>
          </ul>

          <div class="footer">
            <p><strong>DockNow Support Team</strong></p>
            <p>Email: support@docknow.app | Available 24/7</p>
            <p>&copy; ${new Date().getFullYear()} DockNow. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM || `"DockNow Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Support Ticket ${ticketNumber} - ${subject}`,
    html: emailBody,
  });
}

// =====================================================
// MARINA HANDLERS
// =====================================================

/**
 * GET /api/marinas/search
 * Search for marinas with filters
 */
const handleMarinaSearch = async (req: Request, res: Response) => {
  try {
    const {
      city,
      state,
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      amenities,
      businessTypeId,
      minBoatLength,
      maxBoatLength,
      minDraft,
      searchTerm,
      featured,
      // New filter parameters
      seabedTypes,
      mooringTypes,
      pointTypes,
      anchorageTypes,
      protectionLevel,
      marinaFeatures,
      limit = 20,
      offset = 0,
    } = req.query;

    const conditions: string[] = ["m.is_active = TRUE"];
    const params: any[] = [];
    const joins: string[] = [];

    // Helper function to parse array parameters
    const parseArrayParam = (param: any): string[] => {
      if (!param) return [];
      if (Array.isArray(param)) {
        return param
          .map((p) => (typeof p === "string" ? p : String(p)))
          .filter(Boolean);
      }
      if (typeof param === "string") {
        // Handle comma-separated strings or single values
        return param.includes(",")
          ? param
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [param];
      }
      // Handle other types by converting to string
      if (param !== null && param !== undefined) {
        return [String(param)].filter(Boolean);
      }
      return [];
    };

    // Base filtering conditions
    if (city) {
      conditions.push("m.city = ?");
      params.push(city);
    }
    if (state) {
      conditions.push("m.state = ?");
      params.push(state);
    }
    if (businessTypeId) {
      conditions.push("m.business_type_id = ?");
      params.push(parseInt(businessTypeId as string));
    }
    if (minPrice) {
      conditions.push("m.price_per_day >= ?");
      params.push(parseFloat(minPrice as string));
    }
    if (maxPrice) {
      conditions.push("m.price_per_day <= ?");
      params.push(parseFloat(maxPrice as string));
    }
    if (minBoatLength) {
      conditions.push("m.max_boat_length_meters >= ?");
      params.push(parseFloat(minBoatLength as string));
    }
    if (maxBoatLength) {
      conditions.push("m.max_boat_length_meters >= ?");
      params.push(parseFloat(maxBoatLength as string));
    }
    if (minDraft) {
      conditions.push("m.max_boat_draft_meters >= ?");
      params.push(parseFloat(minDraft as string));
    }
    if (featured === "true") {
      conditions.push("m.is_featured = TRUE");
    }
    if (searchTerm) {
      conditions.push(
        "(LOWER(m.name) LIKE ? OR LOWER(m.description) LIKE ? OR LOWER(m.city) LIKE ?)",
      );
      const searchPattern = `%${(searchTerm as string).toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // New filter conditions

    // Marina features filtering
    const featureArray = parseArrayParam(marinaFeatures);
    if (featureArray.length > 0) {
      joins.push("INNER JOIN marina_features mf ON m.id = mf.marina_id");
      const featureConditions = featureArray.map((feature: string) => {
        switch (feature) {
          case "has_fuel_dock":
            return "mf.has_fuel_dock = 1";
          case "has_pump_out":
            return "mf.has_pump_out = 1";
          case "has_haul_out":
            return "mf.has_haul_out = 1";
          case "has_boat_ramp":
            return "mf.has_boat_ramp = 1";
          case "has_dry_storage":
            return "mf.has_dry_storage = 1";
          case "has_live_aboard":
            return "mf.has_live_aboard = 1";
          case "accepts_transients":
            return "mf.accepts_transients = 1";
          case "accepts_megayachts":
            return "mf.accepts_megayachts = 1";
          default:
            return "1=1";
        }
      });
      if (featureConditions.length > 0) {
        conditions.push(`(${featureConditions.join(" AND ")})`);
      }
    }

    // Seabed types filtering
    const seabedArray = parseArrayParam(seabedTypes);
    if (seabedArray.length > 0) {
      const placeholders = seabedArray.map(() => "?").join(", ");
      joins.push(`
        INNER JOIN (
          SELECT DISTINCT sb.marina_id 
          FROM seabeds sb 
          WHERE sb.seabed_type_id IN (${placeholders})
        ) AS seabed_filter ON m.id = seabed_filter.marina_id
      `);
      seabedArray.forEach((typeId: string) =>
        params.push(parseInt(typeId, 10)),
      );
    }

    // Mooring types filtering
    const mooringArray = parseArrayParam(mooringTypes);
    if (mooringArray.length > 0) {
      const placeholders = mooringArray.map(() => "?").join(", ");
      joins.push(`
        INNER JOIN (
          SELECT DISTINCT mo.marina_id 
          FROM moorings mo 
          WHERE mo.mooring_type_id IN (${placeholders})
        ) AS mooring_filter ON m.id = mooring_filter.marina_id
      `);
      mooringArray.forEach((typeId: string) =>
        params.push(parseInt(typeId, 10)),
      );
    }

    // Point types filtering
    const pointArray = parseArrayParam(pointTypes);
    if (pointArray.length > 0) {
      const placeholders = pointArray.map(() => "?").join(", ");
      joins.push(`
        INNER JOIN (
          SELECT DISTINCT p.marina_id 
          FROM points p 
          WHERE p.point_type_id IN (${placeholders})
        ) AS point_filter ON m.id = point_filter.marina_id
      `);
      pointArray.forEach((typeId: string) => params.push(parseInt(typeId, 10)));
    }

    // Anchorage types filtering
    const anchorageArray = parseArrayParam(anchorageTypes);
    if (anchorageArray.length > 0) {
      const placeholders = anchorageArray.map(() => "?").join(", ");
      joins.push(`
        INNER JOIN (
          SELECT DISTINCT a.marina_id 
          FROM anchorages a 
          WHERE a.anchorage_type_id IN (${placeholders})
        ) AS anchorage_filter ON m.id = anchorage_filter.marina_id
      `);
      anchorageArray.forEach((typeId: string) =>
        params.push(parseInt(typeId, 10)),
      );
    }

    // Protection level filtering (for anchorages)
    if (protectionLevel && protectionLevel !== "all") {
      joins.push(`
        INNER JOIN (
          SELECT DISTINCT a.marina_id 
          FROM anchorages a 
          WHERE a.protection_level = ?
        ) AS protection_filter ON m.id = protection_filter.marina_id
      `);
      params.push(protectionLevel);
    }

    // Amenities filtering (existing logic with better array handling)
    const amenitiesArray = parseArrayParam(amenities);
    if (amenitiesArray.length > 0) {
      const placeholders = amenitiesArray.map(() => "?").join(", ");
      joins.push(`
        INNER JOIN (
          SELECT ma.marina_id, COUNT(DISTINCT ma.amenity_id) as amenity_count
          FROM marina_amenities ma
          INNER JOIN amenity_types at ON ma.amenity_id = at.id
          WHERE at.slug IN (${placeholders})
          GROUP BY ma.marina_id
          HAVING amenity_count = ?
        ) AS amenity_filter ON m.id = amenity_filter.marina_id
      `);
      amenitiesArray.forEach((amenity: string) => params.push(amenity));
      params.push(amenitiesArray.length);
    }

    let availabilityJoin = "";
    if (checkIn && checkOut) {
      availabilityJoin = `
        INNER JOIN (
          SELECT DISTINCT m.id as marina_id
          FROM marinas m
          WHERE EXISTS (
            SELECT 1 FROM slips s
            WHERE s.marina_id = m.id AND s.is_available = 1
            AND NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.slip_id = s.id AND b.status IN ('pending', 'confirmed')
              AND ((b.check_in_date <= ? AND b.check_out_date >= ?)
                OR (b.check_in_date <= ? AND b.check_out_date >= ?)
                OR (b.check_in_date >= ? AND b.check_out_date <= ?))
            )
            AND NOT EXISTS (
              SELECT 1 FROM blocked_dates bd
              WHERE (bd.slip_id = s.id OR bd.slip_id IS NULL)
              AND bd.marina_id = m.id
              AND bd.blocked_date BETWEEN ? AND ?
            )
          )
        ) AS available_marinas ON m.id = available_marinas.marina_id
      `;
      params.push(
        checkIn,
        checkIn,
        checkOut,
        checkOut,
        checkIn,
        checkOut,
        checkIn,
        checkOut,
      );
    }

    const queryStr = `
      SELECT m.*, bt.name as business_type_name,
      (SELECT GROUP_CONCAT(at.name) FROM marina_amenities ma
       INNER JOIN amenity_types at ON ma.amenity_id = at.id
       WHERE ma.marina_id = m.id) as amenities,
      (SELECT COUNT(*) FROM slips WHERE marina_id = m.id) as total_slips,
      (SELECT AVG(rating) FROM reviews WHERE marina_id = m.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE marina_id = m.id) as review_count,
      (SELECT image_url FROM marina_images WHERE marina_id = m.id AND is_primary = 1 LIMIT 1) as primary_image_url,
      (SELECT COUNT(*) FROM marina_images WHERE marina_id = m.id) as total_images
      FROM marinas m
      LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
      ${joins.join(" ")}
      ${availabilityJoin}
      WHERE ${conditions.join(" AND ")}
      ORDER BY m.is_featured DESC, m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const marinas = await query<RowDataPacket[]>(queryStr, params);
    const totalQuery = `SELECT COUNT(DISTINCT m.id) as total FROM marinas m ${joins.join(" ")} ${availabilityJoin} WHERE ${conditions.join(" AND ")}`;
    const totalResult = await query<RowDataPacket[]>(
      totalQuery,
      params.slice(0, -2),
    );
    const total = (totalResult[0] as any)?.total || 0;

    res.json({
      success: true,
      data: {
        marinas,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore:
            parseInt(offset as string) + parseInt(limit as string) < total,
        },
      },
    });
  } catch (error) {
    console.error("Error searching marinas:", error);
    res.status(500).json({ success: false, error: "Failed to search marinas" });
  }
};

/**
 * GET /api/marinas/filters
 * Get available filter options for marina search
 */
const handleMarinaFilters = async (req: Request, res: Response) => {
  try {
    // Existing filter queries
    const amenityTypes = await query<RowDataPacket[]>(
      "SELECT * FROM amenity_types WHERE is_active = 1 ORDER BY name",
    );
    const businessTypes = await query<RowDataPacket[]>(
      "SELECT * FROM marina_business_types WHERE is_active = 1 ORDER BY name",
    );
    const locations = await query<RowDataPacket[]>(
      "SELECT DISTINCT city, state, country FROM marinas WHERE is_active = TRUE ORDER BY city",
    );
    const priceRange = await query<RowDataPacket[]>(
      "SELECT MIN(price_per_day) as min, MAX(price_per_day) as max FROM marinas WHERE is_active = TRUE",
    );

    // Check if new filter tables exist before querying
    let seabedTypes: RowDataPacket[] = [];
    let mooringTypes: RowDataPacket[] = [];
    let pointTypes: RowDataPacket[] = [];
    let anchorageTypes: RowDataPacket[] = [];

    try {
      seabedTypes = await query<RowDataPacket[]>(
        "SELECT * FROM seabed_types WHERE is_active = 1 ORDER BY name",
      );
    } catch (error) {
      console.warn("seabed_types table not found or accessible:", error);
    }

    try {
      mooringTypes = await query<RowDataPacket[]>(
        "SELECT * FROM mooring_types WHERE is_active = 1 ORDER BY name",
      );
    } catch (error) {
      console.warn("mooring_types table not found or accessible:", error);
    }

    try {
      pointTypes = await query<RowDataPacket[]>(
        "SELECT * FROM point_types WHERE is_active = 1 ORDER BY name",
      );
    } catch (error) {
      console.warn("point_types table not found or accessible:", error);
    }

    try {
      anchorageTypes = await query<RowDataPacket[]>(
        "SELECT * FROM anchorage_types WHERE is_active = 1 ORDER BY name",
      );
    } catch (error) {
      console.warn("anchorage_types table not found or accessible:", error);
    }

    // Protection levels (predefined values)
    const protectionLevels = [
      { value: "excellent", label: "Excellent Protection" },
      { value: "good", label: "Good Protection" },
      { value: "moderate", label: "Moderate Protection" },
    ];

    // Marina features (predefined based on marina_features table structure)
    const marinaFeatures = [
      {
        key: "has_fuel_dock",
        name: "Fuel Dock",
        description: "On-site fuel dock available",
      },
      {
        key: "has_pump_out",
        name: "Pump Out",
        description: "Pump out facility available",
      },
      {
        key: "has_haul_out",
        name: "Haul Out",
        description: "Boat haul out services available",
      },
      {
        key: "has_boat_ramp",
        name: "Boat Ramp",
        description: "Boat launch ramp available",
      },
      {
        key: "has_dry_storage",
        name: "Dry Storage",
        description: "Dry storage facilities available",
      },
      {
        key: "has_live_aboard",
        name: "Live Aboard",
        description: "Live aboard boats permitted",
      },
      {
        key: "accepts_transients",
        name: "Accepts Transients",
        description: "Accepts transient boats",
      },
      {
        key: "accepts_megayachts",
        name: "Accepts Megayachts",
        description: "Can accommodate large yachts",
      },
    ];

    const pr = priceRange[0] as any;
    const min = pr ? Number(pr.min) : 0;
    const max = pr ? Number(pr.max) : 10000;

    res.json({
      success: true,
      data: {
        amenityTypes,
        businessTypes,
        locations: locations.map((l: any) => ({
          city: l.city,
          state: l.state ?? "",
          country: l.country,
          label: [l.city, l.state].filter(Boolean).join(", ") || l.city,
        })),
        priceRange: { min, max },
        // New filter options
        seabedTypes,
        mooringTypes,
        pointTypes,
        anchorageTypes,
        protectionLevels,
        marinaFeatures,
      },
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ success: false, error: "Failed to fetch filters" });
  }
};

/**
 * GET /api/marinas/availability
 * Get availability for a specific marina
 */
const handleMarinaAvailability = async (req: Request, res: Response) => {
  try {
    const { marinaId } = req.query;

    if (!marinaId) {
      return res
        .status(400)
        .json({ success: false, error: "Marina ID required" });
    }

    const bookedDates = await query<RowDataPacket[]>(
      `SELECT check_in_date as checkIn, check_out_date as checkOut
       FROM bookings WHERE marina_id = ? AND status IN ('pending', 'confirmed')`,
      [marinaId],
    );

    const blockedDates = await query<RowDataPacket[]>(
      `SELECT blocked_date as date, reason, slip_id as slipId,
       s.slip_number as slipNumber
       FROM blocked_dates bd
       LEFT JOIN slips s ON bd.slip_id = s.id
       WHERE bd.marina_id = ?`,
      [marinaId],
    );

    const availableSlips = await query<RowDataPacket[]>(
      `SELECT id, slip_number as slipNumber, length_meters as length,
       width_meters as width, depth_meters as depth, price_per_day as pricePerDay
       FROM slips WHERE marina_id = ? AND is_available = TRUE`,
      [marinaId],
    );

    res.json({
      success: true,
      data: { bookedDates, blockedDates, availableSlips },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch availability" });
  }
};

/**
 * GET /api/marinas/:slug
 * Get marina details by slug
 */
const handleMarinaDetails = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ success: false, error: "Slug required" });
    }

    const marinas = await query<RowDataPacket[]>(
      `SELECT m.*, bt.name as business_type_name,
       h.full_name as host_name, h.email as host_email, h.phone as host_phone,
       (SELECT GROUP_CONCAT(at.name) FROM marina_amenities ma
        INNER JOIN amenity_types at ON ma.amenity_id = at.id
        WHERE ma.marina_id = m.id) as amenities,
       (SELECT COUNT(*) FROM slips WHERE marina_id = m.id) as total_slips,
       (SELECT COUNT(*) FROM slips WHERE marina_id = m.id AND is_available = TRUE) as available_slips,
       (SELECT MAX(length_meters) FROM slips WHERE marina_id = m.id) as max_slip_length,
       (SELECT MAX(width_meters) FROM slips WHERE marina_id = m.id) as max_slip_width,
       (SELECT MAX(depth_meters) FROM slips WHERE marina_id = m.id) as max_slip_depth,
       (SELECT AVG(rating) FROM reviews WHERE marina_id = m.id) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE marina_id = m.id) as review_count,
       (SELECT image_url FROM marina_images WHERE marina_id = m.id AND is_primary = 1 LIMIT 1) as primary_image_url,
       (SELECT COUNT(*) FROM marina_images WHERE marina_id = m.id) as total_images
       FROM marinas m
       LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
       LEFT JOIN hosts h ON m.host_id = h.id
       WHERE m.slug = ? AND m.is_active = TRUE`,
      [slug],
    );

    if (marinas.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Marina not found" });
    }

    const marina = marinas[0];

    // Fetch marina images
    const images = await query<RowDataPacket[]>(
      `SELECT id, image_url as url, title, is_primary as isPrimary 
       FROM marina_images 
       WHERE marina_id = ? 
       ORDER BY is_primary DESC, display_order ASC`,
      [marina.id],
    );

    // Transform flat structure to nested structure expected by frontend
    const transformedMarina = {
      id: marina.id,
      slug: marina.slug,
      name: marina.name,
      description: marina.description,
      pricePerDay: parseFloat(marina.price_per_day),
      location: {
        city: marina.city,
        state: marina.state,
        country: marina.country,
        address: marina.address,
        postalCode: marina.postal_code,
        coordinates: {
          latitude: parseFloat(marina.latitude) || 0,
          longitude: parseFloat(marina.longitude) || 0,
        },
      },
      contact: {
        name: marina.contact_name || "",
        email: marina.contact_email || "",
        phone: marina.contact_phone || "",
        website: marina.website_url || "",
      },
      capacity: {
        totalSlips: marina.total_slips || 0,
        availableSlips: marina.available_slips || 0,
        maxBoatLength:
          parseFloat(marina.max_slip_length) ||
          parseFloat(marina.max_boat_length_meters) ||
          0,
        maxBoatWidth: parseFloat(marina.max_slip_width) || 0,
        maxBoatDraft:
          parseFloat(marina.max_slip_depth) ||
          parseFloat(marina.max_boat_draft_meters) ||
          0,
      },
      businessType: {
        name: marina.business_type_name || "Marina",
        description: "",
      },
      isFeatured: marina.is_featured === 1,
      rating: {
        average: marina.avg_rating
          ? parseFloat(marina.avg_rating).toFixed(1)
          : "0.0",
        count: marina.review_count || 0,
      },
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        title: img.title || marina.name,
        isPrimary: img.isPrimary === 1,
      })),
      amenities: marina.amenities
        ? marina.amenities.split(",").map((name: string, index: number) => ({
            id: index,
            name: name.trim(),
            icon: "check-circle",
            category: "general",
          }))
        : [],
      reviews: [],
      availability: {
        blockedDates: [],
        bookedDates: [],
      },
      coupons: [],
    };

    res.json({ success: true, data: transformedMarina });
  } catch (error) {
    console.error("Error fetching marina details:", error);
    res.status(500).json({ success: false, error: "Failed to fetch marina" });
  }
};

// =====================================================
// BOOKING ROUTES
// =====================================================

/**
 * GET /api/bookings/my-bookings
 * Get bookings for authenticated user
 */
const handleMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).authUserId;
    const { status } = req.query;

    let queryStr = `
      SELECT b.*, m.name as marina_name, m.slug as marina_slug,
      m.city as marina_city, m.state as marina_state,
      s.slip_number, bo.name as boat_name
      FROM bookings b
      JOIN marinas m ON b.marina_id = m.id
      LEFT JOIN slips s ON b.slip_id = s.id
      JOIN boats bo ON b.boat_id = bo.id
      WHERE b.user_id = ?
    `;
    const params: any[] = [userId];

    if (
      status &&
      ["pending", "confirmed", "cancelled", "completed"].includes(
        status as string,
      )
    ) {
      queryStr += " AND b.status = ?";
      params.push(status);
    }

    queryStr += " ORDER BY b.created_at DESC";

    const bookings = await query<RowDataPacket[]>(queryStr, params);

    // Transform bookings to match frontend expected structure
    const transformedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      totalDays: booking.total_days,
      pricePerDay: parseFloat(booking.price_per_day),
      subtotal: parseFloat(booking.subtotal),
      serviceFee: parseFloat(booking.service_fee),
      discountAmount: parseFloat(booking.discount_amount) || 0,
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
        address: "",
        latitude: 0,
        longitude: 0,
        phone: "",
        email: "",
      },
      slip: booking.slip_number
        ? {
            number: booking.slip_number,
            length: 0,
            width: 0,
          }
        : null,
      boat: {
        id: booking.boat_id,
        name: booking.boat_name,
        model: "",
        manufacturer: "",
        length: 0,
        width: 0,
      },
    }));

    res.json({ success: true, data: transformedBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

/**
 * POST /api/bookings/create-payment-intent
 * Create Stripe payment intent for booking
 */
const handleCreatePaymentIntent = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      marinaId,
      boatId,
      slipId,
      checkIn,
      checkOut,
      couponCode,
      specialRequests,
    } = req.body;

    // Calculate booking details
    const marinas = await query<RowDataPacket[]>(
      "SELECT * FROM marinas WHERE id = ?",
      [marinaId],
    );

    if (marinas.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Marina not found" });
    }

    const marina = marinas[0];

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalDays = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const pricePerDay = marina.price_per_day;
    const subtotal = pricePerDay * totalDays;
    const serviceFee = subtotal * 0.1;
    let discountAmount = 0;

    if (couponCode) {
      const coupons = await query<RowDataPacket[]>(
        "SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND expires_at > NOW()",
        [couponCode],
      );
      if (coupons.length > 0) {
        const coupon = coupons[0];
        discountAmount =
          coupon.discount_type === "percentage"
            ? subtotal * (coupon.discount_value / 100)
            : coupon.discount_value;
      }
    }

    const totalAmount = subtotal + serviceFee - discountAmount;

    // Create Stripe PaymentIntent FIRST before booking
    console.log("Creating payment intent for amount:", totalAmount);

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "usd",
        metadata: {
          marinaId: marinaId.toString(),
          userId: userId.toString(),
        },
      });
    } catch (stripeError: any) {
      console.error("Stripe API error:", stripeError);
      return res.status(500).json({
        success: false,
        error:
          stripeError.message || "Failed to create payment intent with Stripe",
      });
    }

    console.log("Payment intent created:", paymentIntent?.id);

    if (!paymentIntent || !paymentIntent.id) {
      return res.status(500).json({
        success: false,
        error: "Payment intent was created but missing ID",
      });
    }

    // Create booking record AFTER payment intent succeeds
    const bookingResult = await query<ResultSetHeader>(
      `INSERT INTO bookings (user_id, marina_id, boat_id, slip_id, check_in_date, check_out_date,
       total_days, price_per_day, subtotal, service_fee, discount_amount, total_amount,
       coupon_code, special_requests, status, stripe_payment_intent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())`,
      [
        userId,
        marinaId,
        boatId,
        slipId,
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
        paymentIntent.id,
      ],
    );

    const bookingId = bookingResult.insertId;

    // Update payment intent with booking ID
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        bookingId: bookingId.toString(),
        marinaId: marinaId.toString(),
        userId: userId.toString(),
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId,
      totalAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create payment intent" });
  }
};

/**
 * POST /api/bookings/confirm
 * Confirm booking after payment
 */
const handleConfirmBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    await query(
      "UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = ? AND stripe_payment_intent_id = ?",
      [bookingId, paymentIntentId],
    );

    // Fetch booking details for email
    const bookings = await query<RowDataPacket[]>(
      `SELECT b.id, b.total_amount, b.check_in_date, b.check_out_date,
       u.email, u.full_name,
       m.name as marina_name,
       s.slip_number
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN marinas m ON b.marina_id = m.id
       LEFT JOIN slips s ON b.slip_id = s.id
       WHERE b.id = ?`,
      [bookingId],
    );

    if (bookings.length > 0) {
      const booking = bookings[0];
      // Send confirmation email
      await sendBookingConfirmationEmail(
        booking.email,
        booking.full_name || "Guest",
        {
          marinaName: booking.marina_name,
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          slipNumber: booking.slip_number || "TBD",
          totalAmount: parseFloat(booking.total_amount),
          bookingId: booking.id,
        },
      );
    }

    res.json({
      success: true,
      data: {
        id: bookingId,
      },
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to confirm booking" });
  }
};

/**
 * GET /api/bookings/cancellation-requests
 * Get cancellation requests for authenticated user
 */
const handleGetCancellationRequests = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = (req as any).authUserId;
    const { bookingId } = req.query;

    let queryStr = `
      SELECT cr.*, b.check_in_date, b.check_out_date, b.total_amount,
      m.name as marina_name, m.slug as marina_slug,
      u.full_name as responder_name
      FROM cancellation_requests cr
      JOIN bookings b ON cr.booking_id = b.id
      JOIN marinas m ON b.marina_id = m.id
      LEFT JOIN users u ON cr.responded_by = u.id
      WHERE cr.user_id = ?
    `;
    const params: any[] = [userId];

    if (bookingId) {
      queryStr += " AND cr.booking_id = ?";
      params.push(bookingId);
    }

    queryStr += " ORDER BY cr.requested_at DESC";

    const requests = await query<RowDataPacket[]>(queryStr, params);

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching cancellation requests:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cancellation requests",
    });
  }
};

/**
 * POST /api/bookings/validate-coupon
 * Validate a coupon code
 */
const handleValidateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, marinaId } = req.body;

    const coupons = await query<RowDataPacket[]>(
      `SELECT * FROM coupons 
       WHERE code = ? AND is_active = TRUE 
       AND (marina_id IS NULL OR marina_id = ?)
       AND expires_at > NOW()`,
      [code, marinaId],
    );

    if (coupons.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid or expired coupon" });
    }

    res.json({ success: true, coupon: coupons[0] });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to validate coupon" });
  }
};

/**
 * POST /api/bookings/cancel
 * Cancel a booking
 */
const handleCancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, reason } = req.body;

    await query(
      "UPDATE bookings SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = ? WHERE id = ?",
      [reason, bookingId],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, error: "Failed to cancel booking" });
  }
};

/**
 * GET /api/bookings/pre-checkout-steps
 * Get pre-checkout steps for a marina (public endpoint for booking flow)
 */
const handleGetPreCheckoutSteps = async (req: Request, res: Response) => {
  try {
    const { marinaId } = req.query;

    if (!marinaId) {
      return res.status(400).json({
        success: false,
        error: "Marina ID is required",
      });
    }

    // Get pre-checkout steps for the marina
    const steps = await query<RowDataPacket[]>(
      `SELECT pcs.* 
       FROM marina_pre_checkout_steps pcs
       WHERE pcs.marina_id = ? AND pcs.is_active = 1
       ORDER BY pcs.step_order`,
      [marinaId],
    );

    // Get fields for each step
    const stepsWithFields = await Promise.all(
      steps.map(async (step: any) => {
        const fields = await query<RowDataPacket[]>(
          `SELECT * FROM pre_checkout_step_fields 
           WHERE step_id = ? 
           ORDER BY field_order`,
          [step.id],
        );

        return {
          id: step.id,
          marina_id: step.marina_id,
          title: step.title,
          description: step.description,
          step_order: step.step_order,
          is_required: step.is_required === 1,
          is_active: step.is_active === 1,
          external_validation: step.external_validation
            ? typeof step.external_validation === "string"
              ? JSON.parse(step.external_validation)
              : step.external_validation
            : null,
          created_at: step.created_at,
          updated_at: step.updated_at,
          fields: fields.map((field: any) => ({
            id: field.id,
            step_id: field.step_id,
            field_name: field.field_name,
            field_type: field.field_type,
            field_label: field.field_label,
            is_required: field.is_required === 1,
            field_order: field.field_order,
            options: field.options,
            validation_rules: field.validation_rules,
            created_at: field.created_at,
            updated_at: field.updated_at,
          })),
        };
      }),
    );

    res.json({ success: true, steps: stepsWithFields });
  } catch (error) {
    console.error("Error fetching pre-checkout steps:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pre-checkout steps",
    });
  }
};

// =====================================================
// BOAT ROUTES
// =====================================================

/**
 * GET /api/boats
 * Get boats for a user
 */
const handleGetBoats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUserId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const boats = await query<RowDataPacket[]>(
      `SELECT b.*, bt.name as boat_type_name
       FROM boats b
       LEFT JOIN boat_types bt ON b.boat_type_id = bt.id
       WHERE b.owner_id = ? AND b.is_active = 1
       ORDER BY b.created_at DESC`,
      [userId],
    );

    // Keep snake_case to match frontend expectations
    const transformedBoats = boats.map((boat: any) => ({
      id: boat.id,
      boat_name: boat.name,
      boat_type: boat.boat_type_name || "Other",
      boat_type_id: boat.boat_type_id,
      manufacturer: boat.manufacturer,
      model: boat.model,
      year: boat.year,
      length_meters: parseFloat(boat.length_meters),
      width_meters: parseFloat(boat.width_meters || 0),
      draft_meters: parseFloat(boat.draft_meters || 0),
      home_marina: boat.home_marina,
      registration_number: boat.registration_number,
      insurance_provider: boat.insurance_provider,
      insurance_policy_number: boat.insurance_policy_number,
    }));

    res.json({ success: true, boats: transformedBoats });
  } catch (error) {
    console.error("Error fetching boats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch boats" });
  }
};

/**
 * GET /api/boats/types
 * Get all boat types
 */
const handleGetBoatTypes = async (req: Request, res: Response) => {
  try {
    const boatTypes = await query<RowDataPacket[]>(
      "SELECT * FROM boat_types ORDER BY name",
    );

    // Keep snake_case format
    const transformedBoatTypes = boatTypes.map((type: any) => ({
      id: type.id,
      name: type.name,
      description: type.description,
      created_at: type.created_at,
    }));

    res.json({ success: true, data: transformedBoatTypes });
  } catch (error) {
    console.error("Error fetching boat types:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch boat types" });
  }
};

/**
 * POST /api/boats
 * Create a new boat
 */
const handleCreateBoat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUserId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const {
      boat_name,
      boat_type_id,
      manufacturer,
      model,
      year,
      length_meters,
      width_meters,
      draft_meters,
      home_marina,
      registration_number,
      insurance_provider,
      insurance_policy_number,
    } = req.body;

    if (!boat_name || !length_meters) {
      return res
        .status(400)
        .json({ success: false, error: "Boat name and length are required" });
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO boats (owner_id, name, boat_type_id, manufacturer, model, year,
       length_meters, width_meters, draft_meters, home_marina, registration_number,
       insurance_provider, insurance_policy_number, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [
        userId,
        boat_name,
        boat_type_id || null,
        manufacturer || null,
        model || null,
        year || null,
        length_meters,
        width_meters || null,
        draft_meters || null,
        home_marina || null,
        registration_number || null,
        insurance_provider || null,
        insurance_policy_number || null,
      ],
    );

    const boatId = result.insertId;

    const boats = await query<RowDataPacket[]>(
      `SELECT b.*, bt.name as boat_type_name
       FROM boats b
       LEFT JOIN boat_types bt ON b.boat_type_id = bt.id
       WHERE b.id = ?`,
      [boatId],
    );

    const boat = boats[0];

    // Transform to match frontend expectations
    const transformedBoat = {
      id: boat.id,
      boat_name: boat.name,
      boat_type: boat.boat_type_name || "Other",
      boat_type_id: boat.boat_type_id,
      manufacturer: boat.manufacturer,
      model: boat.model,
      year: boat.year,
      length_meters: parseFloat(boat.length_meters),
      width_meters: parseFloat(boat.width_meters || 0),
      draft_meters: parseFloat(boat.draft_meters || 0),
      home_marina: boat.home_marina,
      registration_number: boat.registration_number,
      insurance_provider: boat.insurance_provider,
      insurance_policy_number: boat.insurance_policy_number,
    };

    res.status(201).json({ success: true, boat: transformedBoat });
  } catch (error) {
    console.error("Error creating boat:", error);
    res.status(500).json({ success: false, error: "Failed to create boat" });
  }
};

/**
 * PUT /api/boats/:id
 * Update a boat
 */
const handleUpdateBoat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Boat ID required" });
    }

    const {
      name,
      model,
      manufacturer,
      boatTypeId,
      year,
      lengthMeters,
      widthMeters,
      draftMeters,
      homeMarina,
      registrationNumber,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    await query(
      `UPDATE boats SET name = ?, model = ?, manufacturer = ?, boat_type_id = ?,
       year = ?, length_meters = ?, width_meters = ?, draft_meters = ?,
       home_marina = ?, registration_number = ?, insurance_provider = ?,
       insurance_policy_number = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        model || null,
        manufacturer || null,
        boatTypeId || null,
        year || null,
        lengthMeters || null,
        widthMeters || null,
        draftMeters || null,
        homeMarina || null,
        registrationNumber || null,
        insuranceProvider || null,
        insurancePolicyNumber || null,
        id,
      ],
    );

    const boats = await query<RowDataPacket[]>(
      `SELECT b.*, bt.name as boat_type_name
       FROM boats b
       LEFT JOIN boat_types bt ON b.boat_type_id = bt.id
       WHERE b.id = ?`,
      [id],
    );

    const boat = boats[0];
    const transformedBoat = {
      id: boat.id,
      owner_id: boat.owner_id,
      boat_type_id: boat.boat_type_id,
      boat_type_name: boat.boat_type_name,
      name: boat.name,
      manufacturer: boat.manufacturer,
      model: boat.model,
      year: boat.year,
      length_meters: parseFloat(boat.length_meters),
      width_meters: parseFloat(boat.width_meters),
      draft_meters: parseFloat(boat.draft_meters),
      registration_number: boat.registration_number,
      home_marina: boat.home_marina,
      insurance_provider: boat.insurance_provider,
      insurance_policy_number: boat.insurance_policy_number,
      is_active: boat.is_active === 1,
      created_at: boat.created_at,
      updated_at: boat.updated_at,
    };

    res.json({ success: true, data: transformedBoat });
  } catch (error) {
    console.error("Error updating boat:", error);
    res.status(500).json({ success: false, error: "Failed to update boat" });
  }
};

/**
 * DELETE /api/boats/:id
 * Delete a boat (soft delete)
 */
const handleDeleteBoat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Boat ID required" });
    }

    await query("UPDATE boats SET is_active = FALSE WHERE id = ?", [id]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting boat:", error);
    res.status(500).json({ success: false, error: "Failed to delete boat" });
  }
};

// =====================================================
// SLIP ROUTES
// =====================================================

/**
 * GET /api/slips/available
 * Get available slips for a marina
 */
const handleAvailableSlips = async (req: Request, res: Response) => {
  try {
    const { marinaId, checkIn, checkOut, boatLength, boatWidth, boatDraft } =
      req.query;

    if (!marinaId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "Marina ID, check-in and check-out dates required",
      });
    }

    let queryStr = `
      SELECT s.* FROM slips s
      WHERE s.marina_id = ? AND s.is_available = TRUE
    `;
    const params: any[] = [marinaId];

    if (boatLength) {
      queryStr += " AND s.length_meters >= ?";
      params.push(parseFloat(boatLength as string));
    }
    if (boatWidth) {
      queryStr += " AND s.width_meters >= ?";
      params.push(parseFloat(boatWidth as string));
    }
    if (boatDraft) {
      queryStr += " AND s.depth_meters >= ?";
      params.push(parseFloat(boatDraft as string));
    }

    queryStr += `
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.slip_id = s.id AND b.status IN ('pending', 'confirmed')
        AND ((b.check_in_date <= ? AND b.check_out_date >= ?)
          OR (b.check_in_date <= ? AND b.check_out_date >= ?)
          OR (b.check_in_date >= ? AND b.check_out_date <= ?))
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocked_dates bd
        WHERE (bd.slip_id = s.id OR bd.slip_id IS NULL)
        AND bd.marina_id = s.marina_id
        AND bd.blocked_date BETWEEN ? AND ?
      )
      ORDER BY s.slip_number
    `;
    params.push(
      checkIn,
      checkIn,
      checkOut,
      checkOut,
      checkIn,
      checkOut,
      checkIn,
      checkOut,
    );

    const slips = await query<RowDataPacket[]>(queryStr, params);

    // Transform slips to camelCase
    const transformedSlips = slips.map((slip: any) => ({
      id: slip.id,
      marinaId: slip.marina_id,
      slipNumber: slip.slip_number,
      lengthMeters: parseFloat(slip.length_meters),
      widthMeters: parseFloat(slip.width_meters),
      depthMeters: parseFloat(slip.depth_meters),
      pricePerDay: parseFloat(slip.price_per_day),
      hasPower: slip.has_power === 1,
      hasWater: slip.has_water === 1,
      isAvailable: slip.is_available === 1,
      createdAt: slip.created_at,
      updatedAt: slip.updated_at,
    }));

    res.json({
      success: true,
      data: {
        slips: transformedSlips,
        availableCount: transformedSlips.length,
      },
    });
  } catch (error) {
    console.error("Error fetching available slips:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch available slips" });
  }
};

// =====================================================
// PROFILE ROUTES
// =====================================================

/**
 * GET /api/profile/me
 * Get current user profile
 */
const handleGetProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).authUserId;

    const users = await query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
};

/**
 * PUT /api/profile/me
 * Update current user profile
 */
const handleUpdateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = (req as any).authUserId;
    const {
      full_name,
      phone,
      phone_code,
      country_code,
      date_of_birth,
      profile_image_url,
      general_notifications,
      marketing_notifications,
    } = req.body;

    await query(
      `UPDATE users SET full_name = ?, phone = ?, phone_code = ?, 
       country_code = ?, date_of_birth = ?, profile_image_url = ?,
       general_notifications = ?, marketing_notifications = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        full_name,
        phone || null,
        phone_code || null,
        country_code || null,
        date_of_birth || null,
        profile_image_url || null,
        general_notifications !== undefined ? general_notifications : true,
        marketing_notifications !== undefined ? marketing_notifications : true,
        userId,
      ],
    );

    const users = await query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [userId],
    );

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

// =====================================================
// STRIPE ROUTES
// =====================================================

/**
 * POST /api/stripe/create-identity-session
 * Create Stripe Identity verification session
 */
const handleCreateIdentitySession = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = (req as any).authUserId;
    const { stepId, bookingId, marinaId } = req.body;

    const verificationSession =
      await stripe.identity.verificationSessions.create({
        type: "document",
        metadata: {
          user_id: userId.toString(),
          step_id: stepId.toString(),
          booking_id: bookingId?.toString() || "",
          marina_id: marinaId?.toString() || "",
        },
      });

    await query(
      `INSERT INTO stripe_identity_verifications (user_id, session_id, step_id, marina_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
       ON DUPLICATE KEY UPDATE session_id = VALUES(session_id), status = 'pending', updated_at = NOW()`,
      [userId, verificationSession.id, stepId, marinaId || null],
    );

    res.json({
      success: true,
      clientSecret: verificationSession.client_secret,
      sessionId: verificationSession.id,
    });
  } catch (error) {
    console.error("Error creating identity session:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create identity session" });
  }
};

/**
 * POST /api/webhooks/stripe-identity
 * Handle Stripe Identity webhook
 */
const handleStripeIdentityWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res
        .status(400)
        .json({ success: false, error: "Missing stripe-signature" });
    }

    let event: any;
    try {
      const rawBody = req.body as Buffer;
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_IDENTITY_WEBHOOK_SECRET || "",
      );
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, error: `Webhook Error: ${err.message}` });
    }

    if (event.type === "identity.verification_session.verified") {
      const session = event.data.object;
      const { user_id, step_id } = session.metadata;

      await query(
        `UPDATE stripe_identity_verifications 
         SET status = 'verified', verified_data = ?, updated_at = NOW() 
         WHERE session_id = ?`,
        [JSON.stringify(session), session.id],
      );

      await query(
        `INSERT INTO guest_step_submissions 
         (user_id, step_id, form_data, is_completed, verification_session_id, verification_status, created_at, updated_at)
         VALUES (?, ?, '{}', 1, ?, 'verified', NOW(), NOW())
         ON DUPLICATE KEY UPDATE
         is_completed = 1, verification_session_id = VALUES(verification_session_id),
         verification_status = 'verified', updated_at = NOW()`,
        [user_id, step_id, session.id],
      );
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ success: false, error: "Failed to handle webhook" });
  }
};

// =====================================================
// TRACKING ROUTES
// =====================================================

/**
 * POST /api/track-home-visitor
 * Track home page visitor
 */
const handleTrackHomeVisitor = async (req: Request, res: Response) => {
  try {
    const { sessionId, deviceType, browser, os, landingPage } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, error: "Session ID required" });
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      (req.headers["x-real-ip"] as string) ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.headers["referer"] || null;

    await query(
      `INSERT INTO home_visitors 
      (session_id, ip_address, user_agent, referrer, device_type, browser, os, landing_page, visited_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        sessionId,
        ipAddress,
        userAgent,
        referrer,
        deviceType || "other",
        browser || null,
        os || null,
        landingPage || "/",
      ],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ success: false, error: "Failed to track visitor" });
  }
};

// =====================================================
// ADMIN ROUTES
// =====================================================

/**
 * GET /api/admin/home-analytics
 * Get home page analytics
 */
const handleAdminHomeAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = "30" } = req.query;

    const analytics = await query<RowDataPacket[]>(
      `SELECT 
       DATE(visited_at) as date,
       COUNT(*) as total_visits,
       COUNT(DISTINCT session_id) as unique_visitors,
       SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_visits,
       SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_visits
       FROM home_visitors
       WHERE visited_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(visited_at)
       ORDER BY date DESC`,
      [parseInt(period as string)],
    );

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch analytics" });
  }
};

// =====================================================
// SERVER INITIALIZATION
// =====================================================

// Create the Express app once (reused across invocations)
let app: express.Application | null = null;

function createServer() {
  console.log("🚀 Creating Express server for Vercel...");

  const expressApp = express();

  // Middleware - CORS so UI (same or different origin) can call the API
  expressApp.use(
    cors({
      origin: true, // reflect request origin (same-origin or allow dev/proxy)
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  expressApp.use(express.json({ limit: "10mb" }));
  expressApp.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Safe body parsing middleware that works with Next.js App Router
  expressApp.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`Body parsing for ${req.method} ${req.url}`);

      // Skip body parsing for GET/HEAD requests
      if (req.method === "GET" || req.method === "HEAD") {
        req.body = {};
        console.log("GET/HEAD request - set empty body");
        return next();
      }

      // Check if body is already parsed by Next.js route handler
      if (req.body !== undefined && req.body !== null) {
        console.log(
          "Body already parsed by Next.js, continuing with:",
          typeof req.body,
        );
        return next();
      }

      // Detect if this is coming from Next.js route handler (mock request)
      // Next.js route handler creates mock objects that don't have proper stream methods
      const isNextJSMockRequest =
        !req.readable || !req.socket || typeof req.on !== "function";

      if (isNextJSMockRequest) {
        console.log(
          "Next.js mock request detected - setting empty body (body should have been parsed by route handler)",
        );
        req.body = {};
        return next();
      }

      // Detect other serverless environments
      const isServerless = !!(
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_RUNTIME_API ||
        process.env.NEXT_RUNTIME
      );

      if (isServerless) {
        console.log("Serverless environment - skipping stream parsing");
        req.body = {};
        return next();
      }

      // Only attempt manual parsing for true Node.js server requests with proper stream interfaces
      console.log(
        "Traditional Node.js server - proceeding with manual body parsing",
      );

      const chunks: Buffer[] = [];
      let totalLength = 0;
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      let bodyParsingComplete = false;
      let hasErrored = false;

      const timeoutId = setTimeout(() => {
        if (!bodyParsingComplete && !hasErrored && !res.headersSent) {
          hasErrored = true;
          console.error("Body parsing timeout");
          res.status(408).json({ success: false, error: "Request timeout" });
        }
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeoutId);
        bodyParsingComplete = true;
      };

      const safeErrorHandler = (error: any, source: string) => {
        if (hasErrored || bodyParsingComplete) return;
        hasErrored = true;
        cleanup();
        console.error(
          `Body parsing error from ${source}:`,
          error?.message || "unknown",
        );
        if (!res.headersSent) {
          res.status(400).json({
            success: false,
            error: `Request processing error (${source})`,
          });
        }
      };

      try {
        req.on("data", (chunk: Buffer) => {
          try {
            if (hasErrored || bodyParsingComplete) return;
            totalLength += chunk.length;
            if (totalLength > maxSize) {
              safeErrorHandler(new Error("Request too large"), "size check");
              return;
            }
            chunks.push(chunk);
          } catch (err) {
            safeErrorHandler(err, "data event");
          }
        });

        req.on("end", () => {
          try {
            if (hasErrored || bodyParsingComplete) return;
            cleanup();

            const body =
              chunks.length > 0
                ? Buffer.concat(chunks as any[]).toString("utf8")
                : "";
            const contentType = req.headers["content-type"] || "";

            if (contentType.includes("application/json")) {
              req.body = body ? JSON.parse(body) : {};
            } else if (
              contentType.includes("application/x-www-form-urlencoded")
            ) {
              const querystring = require("querystring");
              req.body = querystring.parse(body);
            } else {
              req.body = body || {};
            }

            (req as any).rawBody =
              chunks.length > 0
                ? Buffer.concat(chunks as any[])
                : Buffer.alloc(0);
            next();
          } catch (err) {
            safeErrorHandler(err, "end event processing");
          }
        });

        req.on("error", (err: any) => {
          safeErrorHandler(err, "request stream");
        });

        // Handle zero-length content
        if (req.headers["content-length"] === "0") {
          cleanup();
          req.body = {};
          next();
        }
      } catch (streamError) {
        console.warn(
          "Stream operations failed, setting empty body:",
          (streamError as any)?.message,
        );
        cleanup();
        req.body = {};
        next();
      }
    } catch (middlewareError) {
      console.error("Body parsing middleware error:", middlewareError);
      // Always ensure req.body is set
      if (req.body === undefined) {
        req.body = {};
      }
      next(); // Continue without sending error response
    }
  });

  // Skip built-in Express body parsing entirely to avoid raw-body issues
  // Our custom middleware above handles all body parsing

  // Generic error handling middleware for our custom body parsing
  // Generic error handling middleware for our custom body parsing
  expressApp.use(
    (error: any, req: Request, res: Response, next: NextFunction) => {
      // Handle JSON parsing errors from our manual parsing
      if (error.message && error.message.includes("JSON")) {
        console.error("JSON parsing error:", error.message);
        return res.status(400).json({
          success: false,
          error: "Invalid JSON in request body",
        });
      }

      // Handle size limit errors
      if (error.message && error.message.includes("too large")) {
        console.error("Request entity too large:", error.message);
        return res.status(413).json({
          success: false,
          error: "Request body too large",
        });
      }

      // Handle any remaining custom parsing errors
      if (
        error.message &&
        (error.message.includes("body") || error.message.includes("parsing"))
      ) {
        console.error("Body parsing error:", error.message);
        return res.status(400).json({
          success: false,
          error: "Request body parsing error",
        });
      }

      next(error);
    },
  );

  // Log ALL requests that reach Express
  expressApp.use((req: Request, _res: Response, next: NextFunction) => {
    console.log("=".repeat(60));
    console.log(`[EXPRESS] ${req.method} ${req.url}`);
    console.log(`[EXPRESS] Path: ${req.path}`);
    console.log(`[EXPRESS] Query:`, req.query);
    console.log("=".repeat(60));
    next();
  });

  // ==================== CONFIGURE API ROUTES ====================

  // Health & ping
  expressApp.get("/api/health", handleHealth);
  expressApp.get("/api/ping", handlePing);

  // Auth routes (no auth required)
  expressApp.post("/api/auth/check-guest", handleCheckGuest);
  expressApp.post("/api/auth/register-guest", handleRegisterGuest);
  expressApp.post("/api/auth/send-guest-code", handleSendGuestCode);
  expressApp.post("/api/auth/verify-guest-code", handleVerifyGuestCode);

  // Host auth routes (no auth required)
  expressApp.post("/api/host/send-code", handleHostSendCode);
  expressApp.post("/api/host/verify-code", handleHostVerifyCode);

  // User protected routes
  expressApp.get("/api/auth/me", verifyUserSession, handleAuthMe);
  expressApp.get("/api/profile/me", verifyUserSession, handleGetProfile);
  expressApp.put("/api/profile/me", verifyUserSession, handleUpdateProfile);
  expressApp.get(
    "/api/bookings/my-bookings",
    verifyUserSession,
    handleMyBookings,
  );
  expressApp.post(
    "/api/bookings/create-payment-intent",
    handleCreatePaymentIntent,
  );
  expressApp.post("/api/bookings/confirm", handleConfirmBooking);
  expressApp.post("/api/bookings/validate-coupon", handleValidateCoupon);
  expressApp.post("/api/bookings/cancel", handleCancelBooking);
  expressApp.get(
    "/api/bookings/cancellation-requests",
    verifyUserSession,
    handleGetCancellationRequests,
  );
  expressApp.get("/api/bookings/pre-checkout-steps", handleGetPreCheckoutSteps);
  expressApp.post(
    "/api/stripe/create-identity-session",
    verifyUserSession,
    handleCreateIdentitySession,
  );

  // Host protected routes
  expressApp.get("/api/host/me", verifyHostSession, handleHostMe);
  expressApp.get("/api/host/bookings", verifyHostSession, handleHostBookings);
  expressApp.get("/api/host/marinas", verifyHostSession, handleHostMarinas);
  expressApp.get("/api/host/slips", verifyHostSession, handleHostSlips);
  expressApp.get("/api/host/guests", verifyHostSession, handleHostGuests);
  expressApp.get("/api/host/payments", verifyHostSession, handleHostPayments);
  expressApp.get(
    "/api/host/pre-checkout-steps",
    verifyHostSession,
    handleHostPreCheckoutSteps,
  );
  expressApp.post(
    "/api/host/pre-checkout-steps",
    verifyHostSession,
    handleCreatePreCheckoutStep,
  );
  expressApp.get(
    "/api/host/submissions",
    verifyHostSession,
    handleHostSubmissions,
  );
  expressApp.post(
    "/api/host/approve-booking",
    verifyHostSession,
    handleApproveBooking,
  );
  expressApp.get(
    "/api/host/visitor-analytics",
    verifyHostSession,
    handleHostVisitorAnalytics,
  );

  // Marina routes (public)
  expressApp.get("/api/marinas/search", handleMarinaSearch);
  expressApp.get("/api/marinas/filters", handleMarinaFilters);
  expressApp.get("/api/marinas/availability", handleMarinaAvailability);
  expressApp.get("/api/marinas/:slug", handleMarinaDetails);

  // FAQ routes (public)
  expressApp.get("/api/faq/categories", handleGetFAQCategories);
  expressApp.get("/api/faq/questions", handleGetFAQQuestions);
  expressApp.get("/api/faq/questions/:slug", handleGetFAQQuestion);

  // Support ticket routes
  expressApp.post("/api/support/tickets", handleCreateSupportTicket);
  expressApp.get(
    "/api/support/tickets/my-tickets",
    verifyGuestSession,
    handleGetMyTickets,
  );
  expressApp.get("/api/support/tickets/:ticketNumber", handleGetTicketDetails);

  // Boat routes
  expressApp.get("/api/boats", verifyUserSession, handleGetBoats);
  expressApp.get("/api/boats/types", handleGetBoatTypes);
  expressApp.post("/api/boats", verifyUserSession, handleCreateBoat);
  expressApp.put("/api/boats/:id", verifyUserSession, handleUpdateBoat);
  expressApp.delete("/api/boats/:id", verifyUserSession, handleDeleteBoat);

  // Slip routes
  expressApp.get("/api/slips/available", handleAvailableSlips);

  // Webhook routes
  expressApp.post("/api/webhooks/stripe-identity", handleStripeIdentityWebhook);

  // Tracking routes
  expressApp.post("/api/track-home-visitor", handleTrackHomeVisitor);

  // Admin routes
  expressApp.get("/api/admin/home-analytics", handleAdminHomeAnalytics);

  // 404 handler - only for API routes
  expressApp.use("/api", (_req: Request, res: Response, next: NextFunction) => {
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        message: "API endpoint not found",
      });
    } else {
      next();
    }
  });

  // Error handler
  expressApp.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Express error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    },
  );

  return expressApp;
}

function getApp() {
  if (!app) {
    console.log("Initializing Express app for serverless...");
    app = createServer();
  }
  return app;
}

// Export createServer for development use
export { createServer };

// Export handler for Vercel serverless (returns Promise so platform waits for response)
export default (req: VercelRequest, res: VercelResponse) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const expressApp = getApp();
      const done = (err?: any) => {
        if (err) reject(err);
        else resolve();
      };
      expressApp(req as any, res as any, done);
    } catch (error) {
      console.error("API Handler Error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "A server error has occurred",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
      resolve();
    }
  });
};
