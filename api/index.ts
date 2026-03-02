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
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function query<T = any>(sql: string, values?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, values);
    return results as T;
  } catch (error: any) {
    console.error("Database query error:", error);
    // Single retry on connection reset
    if (error.code === "ECONNRESET" || error.errno === -54) {
      console.log("Connection reset, retrying...");
      const [results] = await pool.execute(sql, values);
      return results as T;
    }
    throw error;
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
// Web-default Stripe client — uses the server env var STRIPE_SECRET_KEY.
// Used for webhooks, host-portal payment retrieval, and all web requests.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

/**
 * Returns the correct Stripe client based on the caller type.
 *
 * - Web  (isMobileApp = false): uses the singleton above (env var STRIPE_SECRET_KEY)
 * - App  (isMobileApp = true) : fetches the secret key from the `environment_keys`
 *   DB table so keys can be rotated without a server re-deploy.
 */
async function getStripeClient(isMobileApp: boolean): Promise<Stripe> {
  if (!isMobileApp) {
    return stripe;
  }
  const useTestMode = process.env.NODE_ENV !== "production";
  const rows = await query<EnvironmentKey[]>(
    `SELECT key_string
     FROM environment_keys
     WHERE title = 'stripe' AND type = 'secret' AND is_test = ?
     LIMIT 1`,
    [useTestMode ? 1 : 0],
  );
  const secretKey = rows[0]?.key_string ?? "";
  if (!secretKey) {
    throw new Error(
      "App Stripe secret key is not configured in the environment_keys table",
    );
  }
  return new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });
}

// ============= ENVIRONMENT KEYS HANDLERS =============

interface EnvironmentKey extends RowDataPacket {
  id: number;
  title: string;
  type: string;
  key_string: string;
  is_test: number;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/payments/config
 * Returns the Stripe publishable key loaded from the DB.
 */
const handleGetPaymentsConfig = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const useTestMode = process.env.NODE_ENV !== "production";
    const testFlag = useTestMode ? 1 : 0;

    const rows = await query<EnvironmentKey[]>(
      `SELECT key_string
       FROM environment_keys
       WHERE title = 'stripe'
         AND type  = 'publishable'
         AND is_test = ?
       LIMIT 1`,
      [testFlag],
    );

    const publishableKey = rows[0]?.key_string ?? "";

    if (!publishableKey) {
      res.status(500).json({
        success: false,
        error: "Stripe publishable key is not configured",
      });
      return;
    }

    res.json({ success: true, publishable_key: publishableKey });
  } catch (error) {
    console.error("[handleGetPaymentsConfig] Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to load Stripe config" });
  }
};

/**
 * GET /api/admin/environment-keys
 * Lists all keys; secret values are masked for security.
 */
const handleGetEnvironmentKeys = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rows = await query<EnvironmentKey[]>(
      `SELECT
         id, title, type,
         CASE
           WHEN LENGTH(key_string) > 4
             THEN CONCAT(REPEAT('*', LENGTH(key_string) - 4), RIGHT(key_string, 4))
           ELSE key_string
         END AS key_string,
         is_test, created_at, updated_at
       FROM environment_keys
       ORDER BY title, is_test DESC`,
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("[handleGetEnvironmentKeys] Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch environment keys" });
  }
};

/**
 * POST /api/admin/environment-keys
 * Creates or updates an environment key.
 * Body: { title, type, keyString, isTest }
 */
const handleUpsertEnvironmentKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      type,
      keyString,
      isTest,
    }: {
      title: string;
      type: string;
      keyString: string;
      isTest: boolean;
    } = req.body;

    if (!title || !type || keyString === undefined || isTest === undefined) {
      res.status(400).json({
        success: false,
        error: "title, type, keyString, and isTest are required",
      });
      return;
    }

    const testFlag = isTest ? 1 : 0;

    const rows = await query<EnvironmentKey[]>(
      `SELECT id
       FROM environment_keys
       WHERE title = ?
         AND type  = ?
         AND is_test = ?
       LIMIT 1`,
      [title, type, testFlag],
    );

    if (rows.length > 0) {
      await query<ResultSetHeader>(
        `UPDATE environment_keys
         SET key_string = ?, updated_at = NOW()
         WHERE id = ?`,
        [keyString, rows[0].id],
      );
    } else {
      await query<ResultSetHeader>(
        `INSERT INTO environment_keys (title, type, key_string, is_test)
         VALUES (?, ?, ?, ?)`,
        [title, type, keyString, testFlag],
      );
    }

    res.json({ success: true, message: "Environment key saved successfully" });
  } catch (error) {
    console.error("[handleUpsertEnvironmentKey] Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to save environment key" });
  }
};

/**
 * DELETE /api/admin/environment-keys/:id
 */
const handleDeleteEnvironmentKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res
        .status(400)
        .json({ success: false, error: "Valid id param required" });
      return;
    }

    await query<ResultSetHeader>(`DELETE FROM environment_keys WHERE id = ?`, [
      Number(id),
    ]);

    res.json({ success: true, message: "Environment key deleted" });
  } catch (error) {
    console.error("[handleDeleteEnvironmentKey] Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete environment key" });
  }
};

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
            background: linear-gradient(135deg, #020617 0%, #0f1729 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper { max-width: 600px; margin: 0 auto; }
          .container { 
            background: #0f1729; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(14, 165, 233, 0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #020617 0%, #1d2839 60%, #344156 100%);
            color: white; 
            padding: 45px 30px;
            text-align: center;
            border-bottom: 1px solid rgba(14, 165, 233, 0.2);
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
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .header p { 
            font-size: 16px; 
            color: rgba(148, 163, 184, 0.95);
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px;
            background: #0f1729;
          }
          .greeting {
            font-size: 24px;
            color: #f1f5f9;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .message {
            font-size: 16px;
            color: #94a3b8;
            margin-bottom: 30px;
          }
          .code-container {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 8px 40px rgba(14, 165, 233, 0.35);
            border: 1px solid rgba(14, 165, 233, 0.3);
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
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            padding: 15px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: inline-block;
          }
          .info-box {
            background: #1d2839;
            border: 1px solid #344156;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
          }
          .info-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 14px;
            color: #94a3b8;
            background: #0f1729;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 3px solid #0ea5e9;
          }
          .info-item strong { color: #f1f5f9; }
          .info-item:last-child {
            margin-bottom: 0;
          }
          .info-icon {
            margin-right: 10px;
            font-size: 18px;
          }
          .security-note {
            background: #1d2839;
            border: 1px solid #344156;
            border-radius: 8px;
            padding: 16px;
            margin-top: 25px;
            font-size: 14px;
            color: #64748b;
            text-align: center;
          }
          .footer { 
            background: #020617;
            color: #475569; 
            font-size: 13px; 
            text-align: center; 
            padding: 30px;
            border-top: 1px solid #1d2839;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 700;
            color: #0ea5e9;
            margin-bottom: 5px;
          }
          .footer-tagline {
            color: #475569;
            margin-bottom: 15px;
          }
          .footer-links {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #1d2839;
          }
          .footer-link {
            color: #38bdf8;
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
            background: linear-gradient(135deg, #020617 0%, #0f1729 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper { max-width: 650px; margin: 0 auto; }
          .container { 
            background: #0f1729; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(14, 165, 233, 0.12);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #020617 0%, #1d2839 60%, #344156 100%);
            color: white; 
            padding: 50px 40px;
            text-align: center;
            position: relative;
            border-bottom: 1px solid rgba(14, 165, 233, 0.2);
          }
          .success-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 50%;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 52px;
            box-shadow: 0 8px 40px rgba(14, 165, 233, 0.4);
            border: 3px solid rgba(56, 189, 248, 0.4);
            color: white;
            font-weight: bold;
          }
          .header h1 { 
            font-size: 36px; 
            font-weight: 800; 
            margin-bottom: 10px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          .header p { 
            font-size: 18px; 
            color: rgba(148, 163, 184, 0.95);
            font-weight: 500;
          }
          .content { 
            padding: 45px 40px;
            background: #0f1729;
          }
          .greeting {
            font-size: 28px;
            color: #f1f5f9;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .message {
            font-size: 17px;
            color: #94a3b8;
            margin-bottom: 35px;
            line-height: 1.7;
          }
          .message strong { color: #38bdf8; }
          .booking-card {
            background: #1d2839;
            border-radius: 16px;
            padding: 35px;
            margin: 35px 0;
            border: 1px solid #344156;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
          .booking-id {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 25px;
            box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            border-bottom: 1px solid #344156;
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
            color: #f1f5f9;
            font-weight: 700;
          }
          .total-row {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            margin: 25px -35px -35px;
            padding: 25px 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 0 0 14px 14px;
            box-shadow: 0 -4px 20px rgba(14, 165, 233, 0.2);
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
            gap: 16px;
            margin: 35px 0;
          }
          .feature-card {
            text-align: center;
            padding: 25px 20px;
            background: #1d2839;
            border-radius: 12px;
            border: 1px solid #344156;
          }
          .feature-icon {
            font-size: 36px;
            margin-bottom: 12px;
          }
          .feature-title {
            font-size: 14px;
            font-weight: 700;
            color: #38bdf8;
          }
          .cta-button {
            display: block;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 8px 32px rgba(14, 165, 233, 0.4);
          }
          .support-box {
            background: #1d2839;
            border: 1px solid #344156;
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
            text-align: center;
          }
          .support-text {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 15px;
          }
          .support-text strong { color: #f1f5f9; }
          .footer { 
            background: #020617;
            color: #475569; 
            font-size: 13px; 
            text-align: center; 
            padding: 35px 40px;
            border-top: 1px solid #1d2839;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #0ea5e9;
            margin-bottom: 8px;
          }
          .footer-tagline {
            color: #475569;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .footer-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #1d2839;
          }
          .footer-link {
            color: #38bdf8;
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
            background: linear-gradient(135deg, #020617 0%, #0f1729 100%);
            padding: 40px 20px;
            line-height: 1.6;
          }
          .email-wrapper { max-width: 600px; margin: 0 auto; }
          .container { 
            background: #0f1729; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(14, 165, 233, 0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #020617 0%, #1d2839 60%, #344156 100%);
            color: white; 
            padding: 45px 30px;
            text-align: center;
            border-bottom: 1px solid rgba(14, 165, 233, 0.2);
          }
          .logo-img {
            width: 120px;
            height: auto;
            margin: 0 auto 20px;
            display: block;
          }
          .badge {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 10px;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 700; 
            margin: 10px 0 5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .header p { 
            font-size: 16px; 
            color: rgba(148, 163, 184, 0.95);
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px;
            background: #0f1729;
          }
          .greeting {
            font-size: 24px;
            color: #f1f5f9;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .message {
            font-size: 16px;
            color: #94a3b8;
            margin-bottom: 30px;
          }
          .code-container {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            border-radius: 16px;
            padding: 40px 30px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 8px 40px rgba(14, 165, 233, 0.35);
            border: 1px solid rgba(14, 165, 233, 0.3);
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
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            padding: 15px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: inline-block;
          }
          .info-box {
            background: #1d2839;
            border: 1px solid #344156;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
          }
          .info-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 14px;
            color: #94a3b8;
            background: #0f1729;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 3px solid #0ea5e9;
          }
          .info-item strong { color: #f1f5f9; }
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
            background: #1d2839;
            border-radius: 10px;
            border: 1px solid #344156;
          }
          .feature-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          .feature-title {
            font-size: 13px;
            font-weight: 600;
            color: #38bdf8;
          }
          .security-note {
            background: #1d2839;
            border: 1px solid #344156;
            border-radius: 8px;
            padding: 16px;
            margin-top: 25px;
            font-size: 14px;
            color: #64748b;
            text-align: center;
          }
          .footer { 
            background: #020617;
            color: #475569; 
            font-size: 13px; 
            text-align: center; 
            padding: 30px;
            border-top: 1px solid #1d2839;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 700;
            color: #0ea5e9;
            margin-bottom: 5px;
          }
          .footer-tagline {
            color: #475569;
            margin-bottom: 15px;
          }
          .footer-links {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #1d2839;
          }
          .footer-link {
            color: #38bdf8;
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
      INNER JOIN hosts h ON h.marina_id = m.id
      LEFT JOIN slips s ON b.slip_id = s.id
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN boats bo ON b.boat_id = bo.id
      LEFT JOIN boat_types bt ON bo.boat_type_id = bt.id
      LEFT JOIN guest_step_submissions gss ON b.id = gss.booking_id
      WHERE h.id = ?
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
 * GET /api/host/blocked-dates
 * Get blocked dates for host managed marinas
 */
const handleHostBlockedDates = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { marinaId, startDate, endDate } = req.query;

    let queryStr = `
      SELECT bd.id, bd.marina_id, bd.slip_id, bd.blocked_date,
             bd.reason, bd.start_time, bd.end_time, bd.is_all_day, bd.created_at,
             m.name as marina_name, s.slip_number
      FROM blocked_dates bd
      INNER JOIN marinas m ON bd.marina_id = m.id
      INNER JOIN hosts h ON h.marina_id = m.id
      LEFT JOIN slips s ON bd.slip_id = s.id
      WHERE h.id = ?
    `;
    const params: any[] = [hostId];

    if (marinaId) {
      queryStr += " AND bd.marina_id = ?";
      params.push(marinaId);
    }
    if (startDate) {
      queryStr += " AND bd.blocked_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      queryStr += " AND bd.blocked_date <= ?";
      params.push(endDate);
    }

    queryStr += " ORDER BY bd.blocked_date ASC, bd.start_time ASC";

    const blockedDates = await query<RowDataPacket[]>(queryStr, params);

    res.json({ success: true, blockedDates });
  } catch (error) {
    console.error("Error fetching host blocked dates:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch blocked dates" });
  }
};

/**
 * POST /api/host/blocked-dates
 * Create blocked date(s) for host managed marina
 */
const handleCreateHostBlockedDate = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const {
      marinaId,
      slipId,
      startDate,
      endDate,
      reason,
      isAllDay,
      startTime,
      endTime,
    } = req.body;

    const normalizedReason = String(reason || "").trim();

    if (!marinaId || !startDate) {
      return res.status(400).json({
        success: false,
        error: "marinaId and startDate are required",
      });
    }

    if (!normalizedReason) {
      return res.status(400).json({
        success: false,
        error: "reason is required",
      });
    }

    const marinaAccess = await query<RowDataPacket[]>(
      `SELECT 1 FROM hosts WHERE id = ? AND marina_id = ? LIMIT 1`,
      [hostId, marinaId],
    );

    if (marinaAccess.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (slipId) {
      const slipExists = await query<RowDataPacket[]>(
        `SELECT id FROM slips WHERE id = ? AND marina_id = ? LIMIT 1`,
        [slipId, marinaId],
      );
      if (slipExists.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Slip does not belong to selected marina",
        });
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate || startDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid date range" });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        error: "endDate cannot be before startDate",
      });
    }

    const allDay = isAllDay !== false;

    if (!allDay) {
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: "startTime and endTime are required for time intervals",
        });
      }

      if (String(endTime) <= String(startTime)) {
        return res.status(400).json({
          success: false,
          error: "endTime must be after startTime",
        });
      }
    }

    const dates: string[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let inserted = 0;
    for (const dateValue of dates) {
      const result = await query<ResultSetHeader>(
        `INSERT INTO blocked_dates (
          marina_id, slip_id, blocked_date, reason, created_by,
          start_time, end_time, is_all_day, created_at
        )
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, NOW()
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM blocked_dates
          WHERE marina_id = ?
            AND IFNULL(slip_id, 0) = IFNULL(?, 0)
            AND blocked_date = ?
            AND IFNULL(start_time, '00:00:00') = IFNULL(?, '00:00:00')
            AND IFNULL(end_time, '00:00:00') = IFNULL(?, '00:00:00')
            AND is_all_day = ?
        )`,
        [
          marinaId,
          slipId || null,
          dateValue,
          normalizedReason,
          hostId,
          allDay ? null : startTime || null,
          allDay ? null : endTime || null,
          allDay,
          marinaId,
          slipId || null,
          dateValue,
          allDay ? null : startTime || null,
          allDay ? null : endTime || null,
          allDay,
        ],
      );

      if (result.affectedRows > 0) {
        inserted += 1;
      }
    }

    res.status(201).json({
      success: true,
      inserted,
      requested: dates.length,
    });
  } catch (error) {
    console.error("Error creating host blocked date:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create blocked date" });
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
      `SELECT m.*, bt.name as business_type_name, h.role as host_role,
       (SELECT COUNT(*) FROM slips WHERE marina_id = m.id) as total_slips,
       (SELECT COUNT(*) FROM slips WHERE marina_id = m.id AND is_available = TRUE) as available_slips
       FROM marinas m
       INNER JOIN hosts h ON h.marina_id = m.id
       LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
      WHERE h.id = ?
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
      INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?
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

const handleHostMarinaManagement = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;

    const marinas = await query<RowDataPacket[]>(
      `SELECT m.id, m.name, m.city, m.state, m.country, m.is_active, m.updated_at,
              m.price_per_day as marina_price_per_day
       FROM marinas m
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?
       ORDER BY m.name ASC`,
      [hostId],
    );

    if (!marinas.length) {
      return res.json({ success: true, marinas: [] });
    }

    const marinaIds = marinas.map((marina) => Number(marina.id));
    const inPlaceholders = marinaIds.map(() => "?").join(",");

    const [
      slips,
      marinaFeatures,
      amenities,
      anchorages,
      seabeds,
      moorings,
      points,
      images,
    ] = await Promise.all([
      query<RowDataPacket[]>(
        `SELECT s.id, s.marina_id, s.slip_number, s.length_meters, s.width_meters, s.depth_meters,
                s.price_per_day, s.is_available, s.is_reserved, s.has_power, s.has_water,
                s.power_capacity_amps, s.notes, s.updated_at
         FROM slips s
         WHERE s.marina_id IN (${inPlaceholders})
         ORDER BY s.marina_id, s.slip_number`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT mf.id, mf.marina_id, mf.has_fuel_dock, mf.has_pump_out, mf.has_haul_out,
                mf.has_boat_ramp, mf.has_dry_storage, mf.has_live_aboard,
                mf.max_haul_out_weight_tons, mf.accepts_transients, mf.accepts_megayachts,
                mf.updated_at
         FROM marina_features mf
         WHERE mf.marina_id IN (${inPlaceholders})`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT ma.id, ma.marina_id, ma.amenity_id, at.name, at.slug, at.category, at.icon,
                ma.created_at
         FROM marina_amenities ma
         INNER JOIN amenity_types at ON at.id = ma.amenity_id
         WHERE ma.marina_id IN (${inPlaceholders})
         ORDER BY ma.marina_id, at.name`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT a.id, a.marina_id, a.anchorage_type_id, at.name as anchorage_type_name,
                a.name, a.description, a.latitude, a.longitude, a.max_depth_meters,
                a.min_depth_meters, a.capacity, a.price_per_day, a.protection_level,
                a.is_available, a.updated_at
         FROM anchorages a
         INNER JOIN anchorage_types at ON at.id = a.anchorage_type_id
         WHERE a.marina_id IN (${inPlaceholders})
         ORDER BY a.marina_id, a.name`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT sb.id, sb.marina_id, sb.anchorage_id, sb.seabed_type_id,
                st.name as seabed_type_name, st.slug as seabed_type_slug,
                st.holding_quality, sb.description, sb.depth_meters, sb.notes, sb.created_at
         FROM seabeds sb
         INNER JOIN seabed_types st ON st.id = sb.seabed_type_id
         WHERE sb.marina_id IN (${inPlaceholders})
         ORDER BY sb.marina_id, sb.id`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT mo.id, mo.marina_id, mo.mooring_type_id, mt.name as mooring_type_name,
                mo.mooring_number, mo.description, mo.max_boat_length_meters,
                mo.max_boat_weight_tons, mo.depth_meters, mo.price_per_day,
                mo.is_available, mo.latitude, mo.longitude, mo.updated_at
         FROM moorings mo
         INNER JOIN mooring_types mt ON mt.id = mo.mooring_type_id
         WHERE mo.marina_id IN (${inPlaceholders})
         ORDER BY mo.marina_id, mo.mooring_number`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT p.id, p.marina_id, p.point_type_id, pt.name as point_type_name,
                pt.slug as point_type_slug, p.name, p.description, p.latitude, p.longitude,
                p.is_public, p.is_active, p.contact_info, p.operating_hours, p.updated_at
         FROM points p
         INNER JOIN point_types pt ON pt.id = p.point_type_id
         WHERE p.marina_id IN (${inPlaceholders})
         ORDER BY p.marina_id, p.name`,
        marinaIds,
      ),
      query<RowDataPacket[]>(
        `SELECT m.id as marina_id, m.cover_image_url, m.gallery_image_urls
         FROM marinas m
         WHERE m.id IN (${inPlaceholders})`,
        marinaIds,
      ),
    ]);

    const toNumber = (value: any) => {
      if (value === null || value === undefined) return null;
      return Number(value);
    };

    const toBool = (value: any) => Number(value) === 1;

    const groupByMarina = (rows: RowDataPacket[]) => {
      const grouped = new Map<number, RowDataPacket[]>();
      rows.forEach((row) => {
        const marinaId = Number(row.marina_id);
        const existing = grouped.get(marinaId) || [];
        existing.push(row);
        grouped.set(marinaId, existing);
      });
      return grouped;
    };

    const slipsByMarina = groupByMarina(slips);
    const featuresByMarina = groupByMarina(marinaFeatures);
    const amenitiesByMarina = groupByMarina(amenities);
    const anchoragesByMarina = groupByMarina(anchorages);
    const seabedsByMarina = groupByMarina(seabeds);
    const mooringsByMarina = groupByMarina(moorings);
    const pointsByMarina = groupByMarina(points);
    const imagesByMarina = groupByMarina(images);

    const buildPriceRange = (values: number[]) => {
      if (!values.length) return { min: null, max: null };
      return {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    const response = marinas.map((marina) => {
      const marinaId = Number(marina.id);

      const marinaSlips = (slipsByMarina.get(marinaId) || []).map((row) => ({
        id: Number(row.id),
        slip_number: row.slip_number,
        length_meters: toNumber(row.length_meters),
        width_meters: toNumber(row.width_meters),
        depth_meters: toNumber(row.depth_meters),
        price_per_day: Number(row.price_per_day),
        is_available: toBool(row.is_available),
        is_reserved: toBool(row.is_reserved),
        has_power: toBool(row.has_power),
        has_water: toBool(row.has_water),
        power_capacity_amps: toNumber(row.power_capacity_amps),
        notes: row.notes,
        updated_at: row.updated_at,
      }));

      const marinaFeaturesRow = (featuresByMarina.get(marinaId) || [])[0];
      const marinaAmenities = (amenitiesByMarina.get(marinaId) || []).map(
        (row) => ({
          id: Number(row.id),
          amenity_id: Number(row.amenity_id),
          name: row.name,
          slug: row.slug,
          category: row.category,
          icon: row.icon,
        }),
      );

      const marinaAnchorages = (anchoragesByMarina.get(marinaId) || []).map(
        (row) => ({
          id: Number(row.id),
          anchorage_type_id: Number(row.anchorage_type_id),
          anchorage_type_name: row.anchorage_type_name,
          name: row.name,
          description: row.description,
          latitude: toNumber(row.latitude),
          longitude: toNumber(row.longitude),
          max_depth_meters: toNumber(row.max_depth_meters),
          min_depth_meters: toNumber(row.min_depth_meters),
          capacity: toNumber(row.capacity),
          price_per_day: toNumber(row.price_per_day),
          protection_level: row.protection_level,
          is_available: toBool(row.is_available),
          updated_at: row.updated_at,
        }),
      );

      const marinaSeabeds = (seabedsByMarina.get(marinaId) || []).map(
        (row) => ({
          id: Number(row.id),
          anchorage_id: toNumber(row.anchorage_id),
          seabed_type_id: Number(row.seabed_type_id),
          seabed_type_name: row.seabed_type_name,
          seabed_type_slug: row.seabed_type_slug,
          holding_quality: row.holding_quality,
          description: row.description,
          depth_meters: toNumber(row.depth_meters),
          notes: row.notes,
          created_at: row.created_at,
        }),
      );

      const marinaMoorings = (mooringsByMarina.get(marinaId) || []).map(
        (row) => ({
          id: Number(row.id),
          mooring_type_id: Number(row.mooring_type_id),
          mooring_type_name: row.mooring_type_name,
          mooring_number: row.mooring_number,
          description: row.description,
          max_boat_length_meters: toNumber(row.max_boat_length_meters),
          max_boat_weight_tons: toNumber(row.max_boat_weight_tons),
          depth_meters: toNumber(row.depth_meters),
          price_per_day: toNumber(row.price_per_day),
          is_available: toBool(row.is_available),
          latitude: toNumber(row.latitude),
          longitude: toNumber(row.longitude),
          updated_at: row.updated_at,
        }),
      );

      const marinaPoints = (pointsByMarina.get(marinaId) || []).map((row) => ({
        id: Number(row.id),
        point_type_id: Number(row.point_type_id),
        point_type_name: row.point_type_name,
        point_type_slug: row.point_type_slug,
        name: row.name,
        description: row.description,
        latitude: toNumber(row.latitude),
        longitude: toNumber(row.longitude),
        is_public: toBool(row.is_public),
        is_active: toBool(row.is_active),
        contact_info: row.contact_info,
        operating_hours: row.operating_hours,
        updated_at: row.updated_at,
      }));

      const marinaImgRow = (imagesByMarina.get(marinaId) || [])[0];
      const marinaGalleryUrls: string[] = marinaImgRow?.gallery_image_urls
        ? JSON.parse(marinaImgRow.gallery_image_urls)
        : [];
      const marinaImages = [
        ...(marinaImgRow?.cover_image_url
          ? [
              {
                id: 0,
                image_url: marinaImgRow.cover_image_url as string,
                title: null as string | null,
                display_order: 0,
                is_primary: true,
                created_at: null as string | null,
              },
            ]
          : []),
        ...marinaGalleryUrls.map((url: string, i: number) => ({
          id: i + 1,
          image_url: url,
          title: null as string | null,
          display_order: i + 1,
          is_primary: false,
          created_at: null as string | null,
        })),
      ];

      return {
        id: marinaId,
        name: marina.name,
        city: marina.city,
        state: marina.state,
        country: marina.country,
        is_active: Number(marina.is_active),
        updated_at: marina.updated_at,
        marina_price_per_day: Number(marina.marina_price_per_day || 0),
        marina_features: marinaFeaturesRow
          ? {
              id: Number(marinaFeaturesRow.id),
              has_fuel_dock: toBool(marinaFeaturesRow.has_fuel_dock),
              has_pump_out: toBool(marinaFeaturesRow.has_pump_out),
              has_haul_out: toBool(marinaFeaturesRow.has_haul_out),
              has_boat_ramp: toBool(marinaFeaturesRow.has_boat_ramp),
              has_dry_storage: toBool(marinaFeaturesRow.has_dry_storage),
              has_live_aboard: toBool(marinaFeaturesRow.has_live_aboard),
              max_haul_out_weight_tons: toNumber(
                marinaFeaturesRow.max_haul_out_weight_tons,
              ),
              accepts_transients: toBool(marinaFeaturesRow.accepts_transients),
              accepts_megayachts: toBool(marinaFeaturesRow.accepts_megayachts),
              updated_at: marinaFeaturesRow.updated_at,
            }
          : null,
        slips: marinaSlips,
        amenities: marinaAmenities,
        anchorages: marinaAnchorages,
        seabeds: marinaSeabeds,
        moorings: marinaMoorings,
        points: marinaPoints,
        images: marinaImages,
        pricing: {
          slips: buildPriceRange(marinaSlips.map((item) => item.price_per_day)),
          moorings: buildPriceRange(
            marinaMoorings
              .map((item) => item.price_per_day)
              .filter((value): value is number => value !== null),
          ),
          anchorages: buildPriceRange(
            marinaAnchorages
              .map((item) => item.price_per_day)
              .filter((value): value is number => value !== null),
          ),
        },
      };
    });

    res.json({ success: true, marinas: response });
  } catch (error) {
    console.error("Error fetching marina management data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch marina management data",
    });
  }
};

const hasHostMarinaAccess = async (hostId: number, marinaId: number) => {
  const accessRows = await query<RowDataPacket[]>(
    `SELECT 1 FROM hosts WHERE id = ? AND marina_id = ? LIMIT 1`,
    [hostId, marinaId],
  );
  return accessRows.length > 0;
};

const parseOptionalNumber = (value: any) => {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
};

const parseOptionalBoolean = (value: any) => {
  if (value === undefined) return undefined;
  return value === true || value === 1 || value === "1";
};

const handleManageHostMarinaFeatures = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { marinaId, features } = req.body;

    if (!marinaId || !features) {
      return res.status(400).json({
        success: false,
        error: "marinaId and features are required",
      });
    }

    const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const existing = await query<RowDataPacket[]>(
      `SELECT id FROM marina_features WHERE marina_id = ? LIMIT 1`,
      [marinaId],
    );

    const hasFuelDock = parseOptionalBoolean(features.has_fuel_dock);
    const hasPumpOut = parseOptionalBoolean(features.has_pump_out);
    const hasHaulOut = parseOptionalBoolean(features.has_haul_out);
    const hasBoatRamp = parseOptionalBoolean(features.has_boat_ramp);
    const hasDryStorage = parseOptionalBoolean(features.has_dry_storage);
    const hasLiveAboard = parseOptionalBoolean(features.has_live_aboard);
    const acceptsTransients = parseOptionalBoolean(features.accepts_transients);
    const acceptsMegayachts = parseOptionalBoolean(features.accepts_megayachts);
    const maxHaulOutWeightTons = parseOptionalNumber(
      features.max_haul_out_weight_tons,
    );

    if (existing.length > 0) {
      await query(
        `UPDATE marina_features
         SET has_fuel_dock = COALESCE(?, has_fuel_dock),
             has_pump_out = COALESCE(?, has_pump_out),
             has_haul_out = COALESCE(?, has_haul_out),
             has_boat_ramp = COALESCE(?, has_boat_ramp),
             has_dry_storage = COALESCE(?, has_dry_storage),
             has_live_aboard = COALESCE(?, has_live_aboard),
             max_haul_out_weight_tons = COALESCE(?, max_haul_out_weight_tons),
             accepts_transients = COALESCE(?, accepts_transients),
             accepts_megayachts = COALESCE(?, accepts_megayachts),
             updated_at = NOW()
         WHERE marina_id = ?`,
        [
          hasFuelDock === undefined ? null : hasFuelDock,
          hasPumpOut === undefined ? null : hasPumpOut,
          hasHaulOut === undefined ? null : hasHaulOut,
          hasBoatRamp === undefined ? null : hasBoatRamp,
          hasDryStorage === undefined ? null : hasDryStorage,
          hasLiveAboard === undefined ? null : hasLiveAboard,
          maxHaulOutWeightTons,
          acceptsTransients === undefined ? null : acceptsTransients,
          acceptsMegayachts === undefined ? null : acceptsMegayachts,
          marinaId,
        ],
      );
    } else {
      await query(
        `INSERT INTO marina_features (
          marina_id, has_fuel_dock, has_pump_out, has_haul_out, has_boat_ramp,
          has_dry_storage, has_live_aboard, max_haul_out_weight_tons,
          accepts_transients, accepts_megayachts, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          marinaId,
          hasFuelDock ?? false,
          hasPumpOut ?? false,
          hasHaulOut ?? false,
          hasBoatRamp ?? false,
          hasDryStorage ?? false,
          hasLiveAboard ?? false,
          maxHaulOutWeightTons,
          acceptsTransients ?? true,
          acceptsMegayachts ?? false,
        ],
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error managing marina features:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to manage marina features" });
  }
};

const handleManageHostAmenities = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { marinaId, amenityIds } = req.body;

    if (!marinaId || !Array.isArray(amenityIds)) {
      return res.status(400).json({
        success: false,
        error: "marinaId and amenityIds array are required",
      });
    }

    const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    await query(`DELETE FROM marina_amenities WHERE marina_id = ?`, [marinaId]);

    for (const amenityId of amenityIds) {
      await query(
        `INSERT INTO marina_amenities (marina_id, amenity_id, created_at)
         VALUES (?, ?, NOW())`,
        [marinaId, amenityId],
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error managing amenities:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to manage amenities" });
  }
};

const handleManageHostSlips = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { action, marinaId, slipId, slip } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "action is required" });
    }

    if (action === "create") {
      if (!marinaId || !slip) {
        return res.status(400).json({
          success: false,
          error: "marinaId and slip are required",
        });
      }

      const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const result = await query<ResultSetHeader>(
        `INSERT INTO slips (
          marina_id, slip_number, length_meters, width_meters, depth_meters,
          price_per_day, is_available, is_reserved, has_power, has_water,
          power_capacity_amps, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          marinaId,
          slip.slip_number,
          Number(slip.length_meters),
          Number(slip.width_meters),
          parseOptionalNumber(slip.depth_meters),
          Number(slip.price_per_day),
          parseOptionalBoolean(slip.is_available) ?? true,
          parseOptionalBoolean(slip.is_reserved) ?? false,
          parseOptionalBoolean(slip.has_power) ?? true,
          parseOptionalBoolean(slip.has_water) ?? true,
          parseOptionalNumber(slip.power_capacity_amps),
          slip.notes || null,
        ],
      );

      return res.status(201).json({ success: true, slipId: result.insertId });
    }

    if (!slipId) {
      return res
        .status(400)
        .json({ success: false, error: "slipId is required" });
    }

    const slipRows = await query<RowDataPacket[]>(
      `SELECT s.id FROM slips s
       INNER JOIN hosts h ON h.marina_id = s.marina_id
      WHERE s.id = ? AND h.id = ?
       LIMIT 1`,
      [slipId, hostId],
    );

    if (slipRows.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (action === "update") {
      await query(
        `UPDATE slips
         SET slip_number = COALESCE(?, slip_number),
             length_meters = COALESCE(?, length_meters),
             width_meters = COALESCE(?, width_meters),
             depth_meters = COALESCE(?, depth_meters),
             price_per_day = COALESCE(?, price_per_day),
             is_available = COALESCE(?, is_available),
             is_reserved = COALESCE(?, is_reserved),
             has_power = COALESCE(?, has_power),
             has_water = COALESCE(?, has_water),
             power_capacity_amps = COALESCE(?, power_capacity_amps),
             notes = COALESCE(?, notes),
             updated_at = NOW()
         WHERE id = ?`,
        [
          slip?.slip_number ?? null,
          parseOptionalNumber(slip?.length_meters),
          parseOptionalNumber(slip?.width_meters),
          parseOptionalNumber(slip?.depth_meters),
          parseOptionalNumber(slip?.price_per_day),
          parseOptionalBoolean(slip?.is_available),
          parseOptionalBoolean(slip?.is_reserved),
          parseOptionalBoolean(slip?.has_power),
          parseOptionalBoolean(slip?.has_water),
          parseOptionalNumber(slip?.power_capacity_amps),
          slip?.notes ?? null,
          slipId,
        ],
      );
      return res.json({ success: true });
    }

    if (action === "delete") {
      await query(`DELETE FROM slips WHERE id = ?`, [slipId]);
      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Error managing slips:", error);
    res.status(500).json({ success: false, error: "Failed to manage slips" });
  }
};

const handleManageHostAnchorages = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { action, marinaId, anchorageId, anchorage } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "action is required" });
    }

    if (action === "create") {
      if (!marinaId || !anchorage) {
        return res.status(400).json({
          success: false,
          error: "marinaId and anchorage are required",
        });
      }

      const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const result = await query<ResultSetHeader>(
        `INSERT INTO anchorages (
          marina_id, anchorage_type_id, name, description, latitude, longitude,
          max_depth_meters, min_depth_meters, capacity, price_per_day,
          protection_level, is_available, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          marinaId,
          Number(anchorage.anchorage_type_id),
          anchorage.name,
          anchorage.description || null,
          Number(anchorage.latitude),
          Number(anchorage.longitude),
          parseOptionalNumber(anchorage.max_depth_meters),
          parseOptionalNumber(anchorage.min_depth_meters),
          parseOptionalNumber(anchorage.capacity),
          parseOptionalNumber(anchorage.price_per_day),
          anchorage.protection_level || "good",
          parseOptionalBoolean(anchorage.is_available) ?? true,
        ],
      );

      return res
        .status(201)
        .json({ success: true, anchorageId: result.insertId });
    }

    if (!anchorageId) {
      return res.status(400).json({
        success: false,
        error: "anchorageId is required",
      });
    }

    const rows = await query<RowDataPacket[]>(
      `SELECT a.id FROM anchorages a
       INNER JOIN hosts h ON h.marina_id = a.marina_id
      WHERE a.id = ? AND h.id = ?
       LIMIT 1`,
      [anchorageId, hostId],
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (action === "update") {
      await query(
        `UPDATE anchorages
         SET anchorage_type_id = COALESCE(?, anchorage_type_id),
             name = COALESCE(?, name),
             description = COALESCE(?, description),
             latitude = COALESCE(?, latitude),
             longitude = COALESCE(?, longitude),
             max_depth_meters = COALESCE(?, max_depth_meters),
             min_depth_meters = COALESCE(?, min_depth_meters),
             capacity = COALESCE(?, capacity),
             price_per_day = COALESCE(?, price_per_day),
             protection_level = COALESCE(?, protection_level),
             is_available = COALESCE(?, is_available),
             updated_at = NOW()
         WHERE id = ?`,
        [
          parseOptionalNumber(anchorage?.anchorage_type_id),
          anchorage?.name ?? null,
          anchorage?.description ?? null,
          parseOptionalNumber(anchorage?.latitude),
          parseOptionalNumber(anchorage?.longitude),
          parseOptionalNumber(anchorage?.max_depth_meters),
          parseOptionalNumber(anchorage?.min_depth_meters),
          parseOptionalNumber(anchorage?.capacity),
          parseOptionalNumber(anchorage?.price_per_day),
          anchorage?.protection_level ?? null,
          parseOptionalBoolean(anchorage?.is_available),
          anchorageId,
        ],
      );
      return res.json({ success: true });
    }

    if (action === "delete") {
      await query(`DELETE FROM anchorages WHERE id = ?`, [anchorageId]);
      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Error managing anchorages:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to manage anchorages" });
  }
};

const handleManageHostSeabeds = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { action, marinaId, seabedId, seabed } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "action is required" });
    }

    if (action === "create") {
      if (!marinaId || !seabed) {
        return res.status(400).json({
          success: false,
          error: "marinaId and seabed are required",
        });
      }

      const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const result = await query<ResultSetHeader>(
        `INSERT INTO seabeds (
          marina_id, anchorage_id, seabed_type_id, description,
          depth_meters, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          marinaId,
          parseOptionalNumber(seabed.anchorage_id),
          Number(seabed.seabed_type_id),
          seabed.description || null,
          parseOptionalNumber(seabed.depth_meters),
          seabed.notes || null,
        ],
      );

      return res.status(201).json({ success: true, seabedId: result.insertId });
    }

    if (!seabedId) {
      return res
        .status(400)
        .json({ success: false, error: "seabedId is required" });
    }

    const rows = await query<RowDataPacket[]>(
      `SELECT sb.id FROM seabeds sb
       INNER JOIN hosts h ON h.marina_id = sb.marina_id
      WHERE sb.id = ? AND h.id = ?
       LIMIT 1`,
      [seabedId, hostId],
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (action === "update") {
      await query(
        `UPDATE seabeds
         SET anchorage_id = COALESCE(?, anchorage_id),
             seabed_type_id = COALESCE(?, seabed_type_id),
             description = COALESCE(?, description),
             depth_meters = COALESCE(?, depth_meters),
             notes = COALESCE(?, notes)
         WHERE id = ?`,
        [
          parseOptionalNumber(seabed?.anchorage_id),
          parseOptionalNumber(seabed?.seabed_type_id),
          seabed?.description ?? null,
          parseOptionalNumber(seabed?.depth_meters),
          seabed?.notes ?? null,
          seabedId,
        ],
      );
      return res.json({ success: true });
    }

    if (action === "delete") {
      await query(`DELETE FROM seabeds WHERE id = ?`, [seabedId]);
      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Error managing seabeds:", error);
    res.status(500).json({ success: false, error: "Failed to manage seabeds" });
  }
};

const handleManageHostMoorings = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { action, marinaId, mooringId, mooring } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "action is required" });
    }

    if (action === "create") {
      if (!marinaId || !mooring) {
        return res.status(400).json({
          success: false,
          error: "marinaId and mooring are required",
        });
      }

      const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const result = await query<ResultSetHeader>(
        `INSERT INTO moorings (
          marina_id, mooring_type_id, mooring_number, description,
          max_boat_length_meters, max_boat_weight_tons, depth_meters,
          price_per_day, is_available, latitude, longitude, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          marinaId,
          Number(mooring.mooring_type_id),
          mooring.mooring_number,
          mooring.description || null,
          Number(mooring.max_boat_length_meters),
          parseOptionalNumber(mooring.max_boat_weight_tons),
          parseOptionalNumber(mooring.depth_meters),
          Number(mooring.price_per_day),
          parseOptionalBoolean(mooring.is_available) ?? true,
          parseOptionalNumber(mooring.latitude),
          parseOptionalNumber(mooring.longitude),
        ],
      );

      return res
        .status(201)
        .json({ success: true, mooringId: result.insertId });
    }

    if (!mooringId) {
      return res
        .status(400)
        .json({ success: false, error: "mooringId is required" });
    }

    const rows = await query<RowDataPacket[]>(
      `SELECT mo.id FROM moorings mo
       INNER JOIN hosts h ON h.marina_id = mo.marina_id
      WHERE mo.id = ? AND h.id = ?
       LIMIT 1`,
      [mooringId, hostId],
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (action === "update") {
      await query(
        `UPDATE moorings
         SET mooring_type_id = COALESCE(?, mooring_type_id),
             mooring_number = COALESCE(?, mooring_number),
             description = COALESCE(?, description),
             max_boat_length_meters = COALESCE(?, max_boat_length_meters),
             max_boat_weight_tons = COALESCE(?, max_boat_weight_tons),
             depth_meters = COALESCE(?, depth_meters),
             price_per_day = COALESCE(?, price_per_day),
             is_available = COALESCE(?, is_available),
             latitude = COALESCE(?, latitude),
             longitude = COALESCE(?, longitude),
             updated_at = NOW()
         WHERE id = ?`,
        [
          parseOptionalNumber(mooring?.mooring_type_id),
          mooring?.mooring_number ?? null,
          mooring?.description ?? null,
          parseOptionalNumber(mooring?.max_boat_length_meters),
          parseOptionalNumber(mooring?.max_boat_weight_tons),
          parseOptionalNumber(mooring?.depth_meters),
          parseOptionalNumber(mooring?.price_per_day),
          parseOptionalBoolean(mooring?.is_available),
          parseOptionalNumber(mooring?.latitude),
          parseOptionalNumber(mooring?.longitude),
          mooringId,
        ],
      );
      return res.json({ success: true });
    }

    if (action === "delete") {
      await query(`DELETE FROM moorings WHERE id = ?`, [mooringId]);
      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Error managing moorings:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to manage moorings" });
  }
};

const handleManageHostPoints = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { action, marinaId, pointId, point } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "action is required" });
    }

    if (action === "create") {
      if (!marinaId || !point) {
        return res.status(400).json({
          success: false,
          error: "marinaId and point are required",
        });
      }

      const hasAccess = await hasHostMarinaAccess(hostId, Number(marinaId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const result = await query<ResultSetHeader>(
        `INSERT INTO points (
          marina_id, point_type_id, name, description, latitude, longitude,
          is_public, is_active, contact_info, operating_hours, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          marinaId,
          Number(point.point_type_id),
          point.name,
          point.description || null,
          Number(point.latitude),
          Number(point.longitude),
          parseOptionalBoolean(point.is_public) ?? true,
          parseOptionalBoolean(point.is_active) ?? true,
          point.contact_info || null,
          point.operating_hours || null,
        ],
      );

      return res.status(201).json({ success: true, pointId: result.insertId });
    }

    if (!pointId) {
      return res
        .status(400)
        .json({ success: false, error: "pointId is required" });
    }

    const rows = await query<RowDataPacket[]>(
      `SELECT p.id FROM points p
       INNER JOIN hosts h ON h.marina_id = p.marina_id
      WHERE p.id = ? AND h.id = ?
       LIMIT 1`,
      [pointId, hostId],
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (action === "update") {
      await query(
        `UPDATE points
         SET point_type_id = COALESCE(?, point_type_id),
             name = COALESCE(?, name),
             description = COALESCE(?, description),
             latitude = COALESCE(?, latitude),
             longitude = COALESCE(?, longitude),
             is_public = COALESCE(?, is_public),
             is_active = COALESCE(?, is_active),
             contact_info = COALESCE(?, contact_info),
             operating_hours = COALESCE(?, operating_hours),
             updated_at = NOW()
         WHERE id = ?`,
        [
          parseOptionalNumber(point?.point_type_id),
          point?.name ?? null,
          point?.description ?? null,
          parseOptionalNumber(point?.latitude),
          parseOptionalNumber(point?.longitude),
          parseOptionalBoolean(point?.is_public),
          parseOptionalBoolean(point?.is_active),
          point?.contact_info ?? null,
          point?.operating_hours ?? null,
          pointId,
        ],
      );
      return res.json({ success: true });
    }

    if (action === "delete") {
      await query(`DELETE FROM points WHERE id = ?`, [pointId]);
      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Error managing points:", error);
    res.status(500).json({ success: false, error: "Failed to manage points" });
  }
};

const handleManageHostMarinaImages = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = Number((req as any).authHostId);
    const { action, marinaId, imageUrl, image } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, error: "action is required" });
    }

    if (action === "create") {
      if (!marinaId || !image?.image_url) {
        return res.status(400).json({
          success: false,
          error: "marinaId and image.image_url are required",
        });
      }

      const id = Number(marinaId);
      const hasAccess = await hasHostMarinaAccess(hostId, id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const isPrimary = parseOptionalBoolean(image.is_primary) ?? false;

      if (isPrimary) {
        // Store as cover image
        await query(`UPDATE marinas SET cover_image_url = ? WHERE id = ?`, [
          image.image_url,
          id,
        ]);
      } else {
        // Append to gallery_image_urls JSON array
        const rows = await query<RowDataPacket[]>(
          `SELECT gallery_image_urls FROM marinas WHERE id = ? LIMIT 1`,
          [id],
        );
        const existing: string[] = rows[0]?.gallery_image_urls
          ? JSON.parse(rows[0].gallery_image_urls)
          : [];
        existing.push(image.image_url);
        await query(`UPDATE marinas SET gallery_image_urls = ? WHERE id = ?`, [
          JSON.stringify(existing),
          id,
        ]);
      }

      return res.status(201).json({ success: true, imageUrl: image.image_url });
    }

    if (action === "delete") {
      if (!marinaId || !imageUrl) {
        return res.status(400).json({
          success: false,
          error: "marinaId and imageUrl are required",
        });
      }

      const id = Number(marinaId);
      const hasAccess = await hasHostMarinaAccess(hostId, id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const rows = await query<RowDataPacket[]>(
        `SELECT cover_image_url, gallery_image_urls FROM marinas WHERE id = ? LIMIT 1`,
        [id],
      );
      if (!rows.length) {
        return res
          .status(404)
          .json({ success: false, error: "Marina not found" });
      }

      if (rows[0].cover_image_url === imageUrl) {
        await query(`UPDATE marinas SET cover_image_url = NULL WHERE id = ?`, [
          id,
        ]);
      } else {
        const gallery: string[] = rows[0].gallery_image_urls
          ? JSON.parse(rows[0].gallery_image_urls)
          : [];
        const updated = gallery.filter((u) => u !== imageUrl);
        await query(`UPDATE marinas SET gallery_image_urls = ? WHERE id = ?`, [
          JSON.stringify(updated),
          id,
        ]);
      }

      return res.json({ success: true });
    }

    return res.status(400).json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("Error managing marina images:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to manage marina images" });
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
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?
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
 * Get payment information for host with Stripe data
 */
const handleHostPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostId = (req as any).authHostId;

    const payments = await query<RowDataPacket[]>(
      `SELECT b.id as booking_id, b.total_amount, b.created_at as booking_date,
       b.status, b.stripe_payment_intent_id, m.name as marina_name, u.full_name as guest_name,
       u.email as guest_email
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       INNER JOIN hosts h ON h.marina_id = m.id
       INNER JOIN users u ON b.user_id = u.id
      WHERE h.id = ? AND b.status IN ('confirmed', 'completed')
       ORDER BY b.created_at DESC
       LIMIT 50`,
      [hostId],
    );

    // Enhance payments with Stripe data
    const enhancedPayments = await Promise.all(
      payments.map(async (payment) => {
        if (payment.stripe_payment_intent_id) {
          try {
            const stripePayment = await stripe.paymentIntents.retrieve(
              payment.stripe_payment_intent_id,
            );
            return {
              ...payment,
              stripe_status: stripePayment.status,
              stripe_amount: stripePayment.amount / 100,
              stripe_currency: stripePayment.currency,
              stripe_created: new Date(stripePayment.created * 1000),
              stripe_payment_method:
                stripePayment.payment_method_types?.[0] || null,
            };
          } catch (stripeError) {
            console.error(
              `Error fetching Stripe payment ${payment.stripe_payment_intent_id}:`,
              stripeError,
            );
            return {
              ...payment,
              stripe_status: "error",
              stripe_error: "Unable to fetch from Stripe",
            };
          }
        }
        return {
          ...payment,
          stripe_status: "no_payment_intent",
        };
      }),
    );

    const totals = await query<RowDataPacket[]>(
      `SELECT 
       SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as pending_payout,
       SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END) as total_earned,
       COUNT(CASE WHEN b.status IN ('confirmed', 'completed') THEN 1 END) as total_transactions
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?`,
      [hostId],
    );

    res.json({
      success: true,
      payments: enhancedPayments,
      totals: totals[0] || {},
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
};

/**
 * GET /api/host/dashboard/stats
 * Get dashboard statistics for host
 */
const handleHostDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;

    // Get total bookings and revenue (only for marinas the host manages)
    const bookingStats = await query<RowDataPacket[]>(
      `SELECT 
       COUNT(*) as totalBookings,
       SUM(total_amount) as totalRevenue,
       SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as activeBookings
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?`,
      [hostId],
    );

    // Get total marinas managed by this host
    const marinaStats = await query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT h.marina_id) as totalMarinas 
       FROM hosts h 
      WHERE h.id = ?`,
      [hostId],
    );

    // Get recent bookings (only for marinas the host manages)
    const recentBookings = await query<RowDataPacket[]>(
      `SELECT b.id, b.total_amount, b.status, b.created_at,
       m.name as marina_name, u.full_name as guest_name
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       INNER JOIN hosts h ON h.marina_id = m.id
       INNER JOIN users u ON b.user_id = u.id
      WHERE h.id = ?
       ORDER BY b.created_at DESC
       LIMIT 10`,
      [hostId],
    );

    // Get bookings by status (only for marinas the host manages)
    const bookingsByStatus = await query<RowDataPacket[]>(
      `SELECT b.status, COUNT(*) as count
       FROM bookings b
       INNER JOIN marinas m ON b.marina_id = m.id
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?
       GROUP BY b.status`,
      [hostId],
    );

    const stats = {
      totalBookings: bookingStats[0]?.totalBookings || 0,
      totalRevenue: bookingStats[0]?.totalRevenue || 0,
      activeBookings: bookingStats[0]?.activeBookings || 0,
      totalMarinas: marinaStats[0]?.totalMarinas || 0,
      recentBookings,
      bookingsByStatus,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch dashboard stats" });
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
      INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ?
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
      INNER JOIN hosts h ON h.marina_id = m.id
      INNER JOIN users u ON gss.user_id = u.id
      WHERE h.id = ?
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
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE b.id = ? AND h.id = ?`,
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
       INNER JOIN hosts h ON h.marina_id = m.id
      WHERE h.id = ? AND vp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
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
// HOST MANAGEMENT ROUTES (Admin functionality)
// =====================================================

/**
 * GET /api/host/manage-hosts
 * Get all hosts assigned to this marina + available hosts to assign
 */
const handleGetManagedHosts = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { marinaId } = req.query;

    // Get marina with current hosts (if marinaId provided)
    let assignedHosts = [];
    let marinaData = null;
    if (marinaId) {
      const marinas = await query<RowDataPacket[]>(
        `SELECT m.name as marina_name
         FROM marinas m
         INNER JOIN hosts h ON h.marina_id = m.id
         WHERE m.id = ? AND h.id = ? AND h.role IN ('primary', 'manager')`,
        [marinaId, hostId],
      );

      if (marinas.length === 0) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to manage hosts for this marina",
        });
      }

      marinaData = marinas[0];

      // Get all hosts for this marina
      assignedHosts = await query<RowDataPacket[]>(
        `SELECT h.id, h.full_name, h.email, h.phone, h.created_at, h.role,
         CASE WHEN h.role = 'primary' THEN true ELSE false END as is_primary
         FROM hosts h
         WHERE h.marina_id = ? AND h.is_active = 1
         ORDER BY h.role = 'primary' DESC, h.full_name ASC`,
        [marinaId],
      );
    }

    // Get all available hosts that could be assigned
    const assignedHostIds = assignedHosts.map((h) => h.id);
    const availableHosts = await query<RowDataPacket[]>(
      `SELECT h.id, h.full_name, h.email, h.phone, h.created_at,
       COUNT(h2.id) as marina_count
       FROM hosts h
       LEFT JOIN hosts h2 ON h.id = h2.id AND h2.marina_id IS NOT NULL
       WHERE h.is_active = 1 AND (h.marina_id IS NULL OR h.marina_id != ?)
       ${assignedHostIds.length > 0 ? `AND h.id NOT IN (${assignedHostIds.map(() => "?").join(",")})` : ""}
       GROUP BY h.id
       ORDER BY h.created_at DESC`,
      marinaId ? [marinaId, ...assignedHostIds] : assignedHostIds,
    );

    res.json({
      success: true,
      assignedHosts,
      availableHosts,
      marinaId: marinaId || null,
      marinaName: marinaData?.marina_name || null,
    });
  } catch (error) {
    console.error("Error fetching managed hosts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hosts" });
  }
};

/**
 * POST /api/host/assign-host
 * Assign a host to a marina
 */
const handleAssignHost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignerHostId = (req as any).authHostId;
    const { marinaId, hostId } = req.body;

    if (!marinaId || !hostId) {
      return res.status(400).json({
        success: false,
        error: "Marina ID and Host ID are required",
      });
    }

    // Verify the assigner owns this marina
    const marinaCheck = await query<RowDataPacket[]>(
      `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
      [marinaId, assignerHostId],
    );

    if (marinaCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to assign hosts to this marina",
      });
    }

    // Check if host is already assigned to this marina
    const existingAssignment = await query<RowDataPacket[]>(
      `SELECT id FROM hosts WHERE id = ? AND marina_id = ?`,
      [hostId, marinaId],
    );

    if (existingAssignment.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Host is already assigned to this marina",
      });
    }

    // Assign the host to the marina
    await query(
      `UPDATE hosts SET marina_id = ?, role = 'manager' WHERE id = ?`,
      [marinaId, hostId],
    );

    res.json({ success: true, message: "Host assigned successfully" });
  } catch (error) {
    console.error("Error assigning host:", error);
    res.status(500).json({ success: false, error: "Failed to assign host" });
  }
};

/**
 * PUT /api/host/update-host-role
 * Update a host's role at a marina (now just primary vs additional)
 */
const handleUpdateHostRole = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const assignerHostId = (req as any).authHostId;
    const { marinaId, hostId, makePrimary = false } = req.body;

    if (!marinaId || !hostId) {
      return res.status(400).json({
        success: false,
        error: "Marina ID and Host ID are required",
      });
    }

    // Verify the assigner owns this marina
    const marinaCheck = await query<RowDataPacket[]>(
      `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
      [marinaId, assignerHostId],
    );

    if (marinaCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to update this host assignment",
      });
    }

    if (makePrimary) {
      // First, demote current primary host to manager
      await query(
        `UPDATE hosts SET role = 'manager' WHERE marina_id = ? AND role = 'primary'`,
        [marinaId],
      );

      // Then promote the new host to primary
      await query(
        `UPDATE hosts SET role = 'primary' WHERE id = ? AND marina_id = ?`,
        [hostId, marinaId],
      );
    }

    res.json({ success: true, message: "Host role updated successfully" });
  } catch (error) {
    console.error("Error updating host role:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update host role" });
  }
};

/**
 * DELETE /api/host/remove-host
 * Remove a host from a marina
 */
const handleRemoveHost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignerHostId = (req as any).authHostId;
    const { marinaId, hostId } = req.body;

    if (!marinaId || !hostId) {
      return res.status(400).json({
        success: false,
        error: "Marina ID and Host ID are required",
      });
    }

    // Verify the assigner owns this marina
    const marinaCheck = await query<RowDataPacket[]>(
      `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
      [marinaId, assignerHostId],
    );

    if (marinaCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to remove host from this marina",
      });
    }

    // Check if host is assigned to this marina
    const hostCheck = await query<RowDataPacket[]>(
      `SELECT id, role FROM hosts WHERE id = ? AND marina_id = ?`,
      [hostId, marinaId],
    );

    if (hostCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Host is not assigned to this marina",
      });
    }

    const host = hostCheck[0];

    // Can't remove primary host
    if (host.role === "primary") {
      return res.status(400).json({
        success: false,
        error: "Cannot remove primary host. Transfer ownership first.",
      });
    }

    // Remove host from marina
    await query(
      `UPDATE hosts SET marina_id = NULL, role = 'manager' WHERE id = ?`,
      [hostId],
    );

    res.json({ success: true, message: "Host removed successfully" });
  } catch (error) {
    console.error("Error removing host:", error);
    res.status(500).json({ success: false, error: "Failed to remove host" });
  }
};

/**
 * POST /api/host/create-host
 * Create a new host user (admin functionality)
 */
const handleCreateHost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const creatorHostId = (req as any).authHostId;
    const { email, fullName, phone, phoneCode, countryCode } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Email and full name are required",
      });
    }

    // Check if host already exists
    const existingHost = await query<RowDataPacket[]>(
      "SELECT id FROM hosts WHERE email = ?",
      [email],
    );

    if (existingHost.length > 0) {
      return res.status(400).json({
        success: false,
        error: "A host with this email already exists",
      });
    }

    // Create the new host
    const result = await query<ResultSetHeader>(
      `INSERT INTO hosts (email, full_name, phone, phone_code, country_code, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 'host', 1, 0)`,
      [email, fullName, phone || null, phoneCode || null, countryCode || null],
    );

    const newHostId = result.insertId;

    res.json({
      success: true,
      message: "Host created successfully",
      hostId: newHostId,
      host: {
        id: newHostId,
        email,
        full_name: fullName,
        phone,
        user_type: "host",
      },
    });
  } catch (error) {
    console.error("Error creating host:", error);
    res.status(500).json({ success: false, error: "Failed to create host" });
  }
};

// =====================================================
// ADMIN HOST MANAGEMENT HANDLERS (New Structure)
// =====================================================

/**
 * GET /api/admin/hosts
 * Get managed hosts with new admin structure
 */
const handleAdminGetHosts = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const hostId = (req as any).authHostId;
    const { marinaId } = req.query;

    // Get marina with current hosts (if marinaId provided)
    let assignedHosts = [];
    let marinaData = null;
    if (marinaId) {
      const marinas = await query<RowDataPacket[]>(
        `SELECT m.name as marina_name
         FROM marinas m
         INNER JOIN hosts h ON h.marina_id = m.id
         WHERE m.id = ? AND h.id = ? AND h.role IN ('primary', 'manager')`,
        [marinaId, hostId],
      );

      if (marinas.length === 0) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to manage hosts for this marina",
        });
      }

      marinaData = marinas[0];

      // Get all hosts assigned to this marina
      assignedHosts = await query<RowDataPacket[]>(
        `SELECT h.id, h.full_name, h.email, h.phone, h.created_at, h.marina_id, h.role, h.is_active,
         h.created_at as assigned_at
         FROM hosts h
         WHERE h.marina_id = ?
         ORDER BY h.role = 'primary' DESC, h.full_name ASC`,
        [marinaId],
      );
    }

    // Get all available hosts that could be assigned
    const assignedHostIds = assignedHosts.map((h) => h.id);
    const availableHosts = await query<RowDataPacket[]>(
      `SELECT h.id, h.full_name, h.email, h.phone, h.created_at,
       CASE WHEN h.marina_id IS NOT NULL THEN 1 ELSE 0 END as marina_count
       FROM hosts h
       WHERE h.is_active = 1
       ${marinaId ? `AND (h.marina_id IS NULL OR h.marina_id != ?)` : ""}
       ${assignedHostIds.length > 0 ? `AND h.id NOT IN (${assignedHostIds.map(() => "?").join(",")})` : ""}
       GROUP BY h.id, h.full_name, h.email, h.phone, h.created_at
       ORDER BY h.created_at DESC`,
      marinaId ? [marinaId, ...assignedHostIds] : assignedHostIds,
    );

    res.json({
      success: true,
      assignedHosts,
      availableHosts,
      marinaId: marinaId || null,
      marinaName: marinaData?.marina_name || null,
    });
  } catch (error) {
    console.error("Error fetching admin hosts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hosts" });
  }
};

/**
 * POST /api/admin/hosts
 * Create a new host user
 */
const handleAdminCreateHost = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const creatorHostId = (req as any).authHostId;
    const { email, fullName, phone, marinaId, role } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Email and full name are required",
      });
    }

    // Check if host already exists
    const existingHost = await query<RowDataPacket[]>(
      "SELECT id FROM hosts WHERE email = ?",
      [email],
    );

    if (existingHost.length > 0) {
      return res.status(400).json({
        success: false,
        error: "A host with this email already exists",
      });
    }

    // If a marina is specified, verify the creator owns it
    if (marinaId) {
      const marinaCheck = await query<RowDataPacket[]>(
        `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
        [marinaId, creatorHostId],
      );
      if (marinaCheck.length === 0) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized to assign hosts to this marina",
        });
      }
    }

    // Create the new host
    const result = await query<ResultSetHeader>(
      `INSERT INTO hosts (email, full_name, phone, marina_id, role, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, 1, 0)`,
      [email, fullName, phone || null, marinaId || null, role || "manager"],
    );

    const newHostId = result.insertId;

    res.json({
      success: true,
      message: "Host created successfully",
      host: {
        id: newHostId,
        email,
        full_name: fullName,
        phone,
        marina_id: marinaId || null,
        role: role || "manager",
        created_at: new Date().toISOString(),
        marina_count: marinaId ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Error creating admin host:", error);
    res.status(500).json({ success: false, error: "Failed to create host" });
  }
};

/**
 * POST /api/admin/hosts/assign
 * Assign a host to a marina
 */
const handleAdminAssignHost = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const assignerHostId = (req as any).authHostId;
    const { marinaId, hostId, role = "manager" } = req.body;

    if (!marinaId || !hostId) {
      return res.status(400).json({
        success: false,
        error: "Marina ID and Host ID are required",
      });
    }

    // Verify the assigner owns this marina
    const marinaCheck = await query<RowDataPacket[]>(
      `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
      [marinaId, assignerHostId],
    );

    if (marinaCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to assign hosts to this marina",
      });
    }

    // Check if host is already assigned to this marina
    const existingAssignment = await query<RowDataPacket[]>(
      `SELECT id FROM hosts WHERE id = ? AND marina_id = ?`,
      [hostId, marinaId],
    );

    if (existingAssignment.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Host is already assigned to this marina",
      });
    }

    // Assign the host to the marina
    await query(`UPDATE hosts SET marina_id = ?, role = ? WHERE id = ?`, [
      marinaId,
      role,
      hostId,
    ]);

    res.json({
      success: true,
      assignment: {
        hostId,
        marinaId,
        role,
        assignedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error assigning admin host:", error);
    res.status(500).json({ success: false, error: "Failed to assign host" });
  }
};

/**
 * PUT /api/admin/hosts/:hostId/role
 * Update a host's role at a marina
 */
const handleAdminUpdateHostRole = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const assignerHostId = (req as any).authHostId;
    const { hostId } = req.params;
    const { role } = req.body;

    if (!hostId || !role) {
      return res.status(400).json({
        success: false,
        error: "Host ID and role are required",
      });
    }

    // Get the host's current marina assignment
    const hostCheck = await query<RowDataPacket[]>(
      `SELECT marina_id FROM hosts WHERE id = ?`,
      [hostId],
    );

    if (hostCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Host not found",
      });
    }

    const marinaId = hostCheck[0].marina_id;

    if (!marinaId) {
      return res.status(400).json({
        success: false,
        error: "Host is not assigned to any marina",
      });
    }

    // Verify the assigner owns this marina
    const marinaCheck = await query<RowDataPacket[]>(
      `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
      [marinaId, assignerHostId],
    );

    if (marinaCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to update this host's role",
      });
    }

    if (role === "primary") {
      // First, demote current primary host to manager
      await query(
        `UPDATE hosts SET role = 'manager' WHERE marina_id = ? AND role = 'primary'`,
        [marinaId],
      );
    }

    // Update the host's role
    await query(`UPDATE hosts SET role = ? WHERE id = ?`, [role, hostId]);

    res.json({ success: true, message: "Host role updated successfully" });
  } catch (error) {
    console.error("Error updating admin host role:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update host role" });
  }
};

/**
 * DELETE /api/admin/hosts/:hostId
 * Remove a host from their marina assignment
 */
const handleAdminRemoveHost = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const assignerHostId = (req as any).authHostId;
    const { hostId } = req.params;

    if (!hostId) {
      return res.status(400).json({
        success: false,
        error: "Host ID is required",
      });
    }

    // Get the host's current marina assignment
    const hostCheck = await query<RowDataPacket[]>(
      `SELECT marina_id, role FROM hosts WHERE id = ?`,
      [hostId],
    );

    if (hostCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Host not found",
      });
    }

    const host = hostCheck[0];
    const marinaId = host.marina_id;

    if (!marinaId) {
      return res.status(400).json({
        success: false,
        error: "Host is not assigned to any marina",
      });
    }

    // Verify the assigner owns this marina
    const marinaCheck = await query<RowDataPacket[]>(
      `SELECT id FROM marinas WHERE id = ? AND host_id = ?`,
      [marinaId, assignerHostId],
    );

    if (marinaCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to remove host from this marina",
      });
    }

    // Can't remove primary host
    if (host.role === "primary") {
      return res.status(400).json({
        success: false,
        error: "Cannot remove primary host. Transfer ownership first.",
      });
    }

    // Remove host from marina (set marina_id to NULL)
    await query(
      `UPDATE hosts SET marina_id = NULL, role = 'manager' WHERE id = ?`,
      [hostId],
    );

    res.json({ success: true, message: "Host removed successfully" });
  } catch (error) {
    console.error("Error removing admin host:", error);
    res.status(500).json({ success: false, error: "Failed to remove host" });
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
 * Send marina registration notification emails (to host + admin)
 */
async function sendMarinaRegistrationEmails(
  hostEmail: string,
  hostName: string,
  marinaName: string,
  businessTypeName: string,
  city: string,
  country: string,
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log("📋 DEV MODE: Skipping registration emails (no SMTP config)");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.disruptinglabs.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #020617; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #0f1729; border-radius: 20px; overflow: hidden; border: 1px solid rgba(14,165,233,0.15); }
        .header { background: linear-gradient(135deg, #020617 0%, #0c4a6e 100%); padding: 50px 40px; text-align: center; }
        .logo { width: 120px; height: auto; margin: 0 auto 20px; display: block; }
        .header h1 { color: #fff; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { color: rgba(148,163,184,0.9); font-size: 16px; }
        .content { padding: 40px; }
        .greeting { font-size: 22px; color: #f1f5f9; font-weight: 700; margin-bottom: 12px; }
        .text { color: #94a3b8; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
        .card { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); border-radius: 14px; padding: 24px; margin: 24px 0; }
        .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0ea5e9; margin-bottom: 6px; }
        .card-value { font-size: 20px; font-weight: 700; color: #fff; }
        .steps { list-style: none; padding: 0; margin: 0; }
        .steps li { padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .steps li:last-child { border: none; }
        .step-num { font-size: 22px; font-weight: 800; color: #0ea5e9; width: 32px; vertical-align: top; padding-top: 1px; }
        .step-text { color: #94a3b8; font-size: 14px; line-height: 1.6; padding-left: 10px; vertical-align: top; }
        .step-text strong { color: #e2e8f0; }
        .footer { text-align: center; padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer p { color: #475569; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://garbrix.com/navios/assets/images/logo.png" alt="DockNow" class="logo" />
          <h1>Welcome to DockNow!</h1>
          <p>Your application has been received</p>
        </div>
        <div class="content">
          <div class="greeting">Hi ${hostName},</div>
          <p class="text">
            Thank you for joining DockNow! We've received your application to list
            <strong style="color: #e2e8f0;">${marinaName}</strong> — a ${businessTypeName} in ${city}, ${country}.
          </p>
          <div class="card">
            <div class="card-label">Your Venue</div>
            <div class="card-value">${marinaName}</div>
            <div style="color: #64748b; font-size: 14px; margin-top: 6px;">${businessTypeName} · ${city}, ${country}</div>
          </div>
          <p class="text">Here's what happens next:</p>
          <ul class="steps">
            <li>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td class="step-num">1.</td>
                <td class="step-text"><strong>Review</strong> — Our team will review your listing within 1–2 business days.</td>
              </tr></table>
            </li>
            <li>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td class="step-num">2.</td>
                <td class="step-text"><strong>Approval &amp; credentials</strong> — You'll receive your host portal login details once approved.</td>
              </tr></table>
            </li>
            <li>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td class="step-num">3.</td>
                <td class="step-text"><strong>Go live</strong> — Your listing goes live and boaters worldwide can start booking.</td>
              </tr></table>
            </li>
          </ul>
          <p class="text" style="margin-top: 20px;">
            In the meantime, if you have any questions don't hesitate to reach out to us at
            <a href="mailto:support@docknow.app" style="color: #0ea5e9;">support@docknow.app</a>.
          </p>
        </div>
        <div class="footer">
          <p><strong style="color: #94a3b8;">DockNow Team</strong></p>
          <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} DockNow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Welcome email to host
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
    to: hostEmail,
    subject: `Welcome to DockNow — ${marinaName} application received`,
    html: welcomeHtml,
  });

  // Admin notification
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (adminEmail) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `[DockNow Admin] New marina registration: ${marinaName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">New Marina Registration</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Venue Name</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${marinaName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Type</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${businessTypeName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Location</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${city}, ${country}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Host Name</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${hostName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Host Email</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${hostEmail}</td></tr>
          </table>
          <p style="margin-top: 16px; color: #64748b;">Please review and approve this listing in the admin dashboard.</p>
        </div>
      `,
    });
  }
}

/**
 * POST /api/marina-registration
 * Public endpoint — submit a marina or private port for review.
 * Creates the marina with is_active = 0 and a pending host account.
 * Sends welcome + admin notification emails.
 */
const handleMarinaRegistration = async (req: Request, res: Response) => {
  try {
    const {
      host_name,
      host_email,
      host_phone,
      company_name,
      business_type_id,
      name,
      description,
      price_per_day,
      address,
      city,
      state,
      country,
      postal_code,
      latitude,
      longitude,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
      total_slips,
      max_boat_length_meters,
      max_boat_draft_meters,
      has_fuel_dock,
      has_pump_out,
      has_haul_out,
      has_boat_ramp,
      has_dry_storage,
      has_live_aboard,
      accepts_transients,
      accepts_megayachts,
      amenity_ids,
      seabed_type_id,
      seabed_depth_meters,
      seabed_description,
      seabed_notes,
      cover_image_url,
      gallery_image_urls,
    } = req.body;

    // Validate required fields
    if (
      !host_name ||
      !host_email ||
      !name ||
      !description ||
      !city ||
      !country ||
      !latitude ||
      !longitude
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Generate slug from marina name
    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Ensure slug uniqueness
    const existing = await query<RowDataPacket[]>(
      "SELECT id FROM marinas WHERE slug LIKE ? LIMIT 10",
      [`${slugBase}%`],
    );
    const slug = existing.length === 0 ? slugBase : `${slugBase}-${Date.now()}`;

    // 1. Create the marina (inactive, not featured)
    const marinaResult = await query<ResultSetHeader>(
      `INSERT INTO marinas
        (name, slug, description, business_type_id, price_per_day,
         city, state, country, address, postal_code,
         latitude, longitude, contact_name, contact_email, contact_phone,
         website_url, total_slips, available_slips,
         max_boat_length_meters, max_boat_draft_meters,
         is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        name,
        slug,
        description,
        business_type_id || 1,
        parseFloat(price_per_day) || 0,
        city,
        state || null,
        country,
        address || null,
        postal_code || null,
        parseFloat(latitude),
        parseFloat(longitude),
        contact_name || host_name,
        contact_email || host_email,
        contact_phone || host_phone || null,
        website_url || null,
        parseInt(total_slips) || 0,
        parseInt(total_slips) || 0,
        max_boat_length_meters ? parseFloat(max_boat_length_meters) : null,
        max_boat_draft_meters ? parseFloat(max_boat_draft_meters) : null,
      ],
    );

    const marinaId = marinaResult.insertId;

    // 2. Create marina features row
    await query(
      `INSERT INTO marina_features
        (marina_id, has_fuel_dock, has_pump_out, has_haul_out, has_boat_ramp,
         has_dry_storage, has_live_aboard, accepts_transients, accepts_megayachts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        marinaId,
        has_fuel_dock ? 1 : 0,
        has_pump_out ? 1 : 0,
        has_haul_out ? 1 : 0,
        has_boat_ramp ? 1 : 0,
        has_dry_storage ? 1 : 0,
        has_live_aboard ? 1 : 0,
        accepts_transients !== false ? 1 : 0,
        accepts_megayachts ? 1 : 0,
      ],
    );

    // 3. Insert amenities
    if (Array.isArray(amenity_ids) && amenity_ids.length > 0) {
      const placeholders = amenity_ids.map(() => "(?, ?)").join(", ");
      const flatValues = amenity_ids.flatMap((id: number) => [marinaId, id]);
      await query(
        `INSERT INTO marina_amenities (marina_id, amenity_id) VALUES ${placeholders}`,
        flatValues,
      );
    }

    // 3a. Insert seabed (optional)
    if (seabed_type_id) {
      await query(
        `INSERT INTO seabeds (marina_id, seabed_type_id, description, depth_meters, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          marinaId,
          seabed_type_id,
          seabed_description || null,
          seabed_depth_meters ? parseFloat(seabed_depth_meters) : null,
          seabed_notes || null,
        ],
      );
    }

    // 3b. Update image URLs (optional)
    if (
      cover_image_url ||
      (Array.isArray(gallery_image_urls) && gallery_image_urls.length > 0)
    ) {
      await query(
        `UPDATE marinas SET cover_image_url = ?, gallery_image_urls = ? WHERE id = ?`,
        [
          cover_image_url || null,
          Array.isArray(gallery_image_urls) && gallery_image_urls.length > 0
            ? JSON.stringify(gallery_image_urls)
            : null,
          marinaId,
        ],
      );
    }

    // 4. Create host account (inactive, not email-verified)
    // Check if host with this email already exists
    const existingHosts = await query<RowDataPacket[]>(
      "SELECT id FROM hosts WHERE email = ? LIMIT 1",
      [host_email],
    );

    let hostId: number;
    if (existingHosts.length > 0) {
      hostId = existingHosts[0].id;
      // Link to new marina
      await query("UPDATE hosts SET marina_id = ? WHERE id = ?", [
        marinaId,
        hostId,
      ]);
    } else {
      const hostResult = await query<ResultSetHeader>(
        `INSERT INTO hosts (marina_id, role, email, full_name, phone, company_name, is_active, email_verified)
         VALUES (?, 'primary', ?, ?, ?, ?, 0, 0)`,
        [
          marinaId,
          host_email,
          host_name,
          host_phone || null,
          company_name || null,
        ],
      );
      hostId = hostResult.insertId;
    }

    // 5. Link host to marina
    await query("UPDATE marinas SET host_id = ? WHERE id = ?", [
      hostId,
      marinaId,
    ]);

    // 6. Fetch business type name for the email
    const businessTypes = await query<RowDataPacket[]>(
      "SELECT name FROM marina_business_types WHERE id = ? LIMIT 1",
      [business_type_id || 1],
    );
    const businessTypeName = businessTypes[0]?.name || "Marina";

    // 7. Send welcome + admin notification emails
    try {
      await sendMarinaRegistrationEmails(
        host_email,
        host_name,
        name,
        businessTypeName,
        city,
        country,
      );
    } catch (emailErr) {
      console.error("⚠️ Failed to send registration emails:", emailErr);
      // Non-fatal — continue
    }

    return res.status(201).json({
      success: true,
      message:
        "Your venue has been submitted for review. Check your inbox for a welcome email!",
      marina_id: marinaId,
    });
  } catch (error: any) {
    console.error("Marina registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit registration. Please try again.",
    });
  }
};

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
      m.cover_image_url as primary_image_url,
      NULL as total_images
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
    const { marinaId, checkIn, checkOut } = req.query;

    if (!marinaId) {
      return res
        .status(400)
        .json({ success: false, error: "Marina ID required" });
    }

    if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
      return res.status(400).json({
        success: false,
        error:
          "Both checkIn and checkOut are required when filtering availability",
      });
    }

    const hasDateRange = Boolean(checkIn && checkOut);

    if (hasDateRange) {
      const checkInDate = new Date(String(checkIn));
      const checkOutDate = new Date(String(checkOut));

      if (
        Number.isNaN(checkInDate.getTime()) ||
        Number.isNaN(checkOutDate.getTime()) ||
        checkOutDate <= checkInDate
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid checkIn/checkOut range",
        });
      }
    }

    const bookedDates = await query<RowDataPacket[]>(
      `SELECT check_in_date as checkIn, check_out_date as checkOut
       FROM bookings WHERE marina_id = ? AND status IN ('pending', 'confirmed')`,
      [marinaId],
    );

    const blockedDates = await query<RowDataPacket[]>(
      `SELECT blocked_date as date, reason, slip_id as slipId,
       start_time as startTime, end_time as endTime, is_all_day as isAllDay,
       s.slip_number as slipNumber
       FROM blocked_dates bd
       LEFT JOIN slips s ON bd.slip_id = s.id
       WHERE bd.marina_id = ?`,
      [marinaId],
    );

    const availableSlips = hasDateRange
      ? await query<RowDataPacket[]>(
          `SELECT s.id, s.slip_number as slipNumber, s.length_meters as length,
           s.width_meters as width, s.depth_meters as depth, s.price_per_day as pricePerDay
           FROM slips s
           WHERE s.marina_id = ?
             AND s.is_available = TRUE
             AND NOT EXISTS (
               SELECT 1 FROM bookings b
               WHERE b.slip_id = s.id
                 AND b.status IN ('pending', 'confirmed')
                 AND (
                   (b.check_in_date <= ? AND b.check_out_date >= ?)
                   OR (b.check_in_date <= ? AND b.check_out_date >= ?)
                   OR (b.check_in_date >= ? AND b.check_out_date <= ?)
                 )
             )
             AND NOT EXISTS (
               SELECT 1 FROM blocked_dates bd
               WHERE bd.marina_id = s.marina_id
                 AND (bd.slip_id = s.id OR bd.slip_id IS NULL)
                 AND bd.blocked_date BETWEEN ? AND ?
             )`,
          [
            marinaId,
            checkIn,
            checkIn,
            checkOut,
            checkOut,
            checkIn,
            checkOut,
            checkIn,
            checkOut,
          ],
        )
      : await query<RowDataPacket[]>(
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
 * GET /api/marinas/popular-destinations
 * Returns top cities grouped by marina count and average rating.
 */
const handlePopularDestinations = async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || "8");

    const rows = await query<RowDataPacket[]>(
      `SELECT
         m.city,
         m.state,
         m.country,
         (
           SELECT cover_image_url
           FROM marinas
           WHERE city = m.city AND state <=> m.state AND is_active = 1
             AND cover_image_url IS NOT NULL
           ORDER BY is_featured DESC, created_at DESC
           LIMIT 1
         ) AS image_url,
         ROUND(
           (
             SELECT AVG(r.rating)
             FROM reviews r
             INNER JOIN marinas m2 ON r.marina_id = m2.id
             WHERE m2.city = m.city AND m2.state <=> m.state AND m2.is_active = 1
           ),
           1
         ) AS avg_rating,
         COUNT(DISTINCT m.id) AS marina_count
       FROM marinas m
       WHERE m.is_active = 1
       GROUP BY m.city, m.state, m.country
       ORDER BY marina_count DESC, avg_rating DESC
       LIMIT ?`,
      [limit],
    );

    const destinations = rows.map((row) => ({
      city: row.city,
      state: row.state || null,
      country: row.country,
      image_url: row.image_url || null,
      avg_rating: row.avg_rating ? Number(row.avg_rating) : null,
      marina_count: Number(row.marina_count),
    }));

    res.json({ success: true, data: destinations });
  } catch (error) {
    console.error("Error fetching popular destinations:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch popular destinations" });
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
       (SELECT COUNT(*) FROM reviews WHERE marina_id = m.id) as review_count
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

    // Build images from inline columns (cover_image_url + gallery_image_urls JSON array)
    const galleryUrls: string[] = marina.gallery_image_urls
      ? JSON.parse(marina.gallery_image_urls)
      : [];
    const marinaImages = [
      ...(marina.cover_image_url
        ? [
            {
              url: marina.cover_image_url as string,
              isPrimary: true,
              title: marina.name as string,
            },
          ]
        : []),
      ...galleryUrls.map((url: string) => ({
        url,
        isPrimary: false,
        title: marina.name as string,
      })),
    ];

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
      isDirectoryOnly: marina.is_directory_only === 1,
      rating: {
        average: marina.avg_rating
          ? parseFloat(marina.avg_rating).toFixed(1)
          : "0.0",
        count: marina.review_count || 0,
      },
      images: marinaImages,
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
      isMobileApp,
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

    const stripeClient = await getStripeClient(!!isMobileApp);
    let paymentIntent;
    try {
      paymentIntent = await stripeClient.paymentIntents.create({
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
    await stripeClient.paymentIntents.update(paymentIntent.id, {
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
    const { stepId, bookingId, marinaId, isMobileApp } = req.body;

    const stripeClient = await getStripeClient(!!isMobileApp);
    const verificationSession =
      await stripeClient.identity.verificationSessions.create({
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
  expressApp.get(
    "/api/host/blocked-dates",
    verifyHostSession,
    handleHostBlockedDates,
  );
  expressApp.post(
    "/api/host/blocked-dates",
    verifyHostSession,
    handleCreateHostBlockedDate,
  );
  expressApp.get("/api/host/marinas", verifyHostSession, handleHostMarinas);
  expressApp.get("/api/host/slips", verifyHostSession, handleHostSlips);
  expressApp.get(
    "/api/host/marina-management",
    verifyHostSession,
    handleHostMarinaManagement,
  );
  expressApp.post(
    "/api/host/marina-management/slips",
    verifyHostSession,
    handleManageHostSlips,
  );
  expressApp.post(
    "/api/host/marina-management/marina-features",
    verifyHostSession,
    handleManageHostMarinaFeatures,
  );
  expressApp.post(
    "/api/host/marina-management/amenities",
    verifyHostSession,
    handleManageHostAmenities,
  );
  expressApp.post(
    "/api/host/marina-management/anchorages",
    verifyHostSession,
    handleManageHostAnchorages,
  );
  expressApp.post(
    "/api/host/marina-management/seabeds",
    verifyHostSession,
    handleManageHostSeabeds,
  );
  expressApp.post(
    "/api/host/marina-management/moorings",
    verifyHostSession,
    handleManageHostMoorings,
  );
  expressApp.post(
    "/api/host/marina-management/points",
    verifyHostSession,
    handleManageHostPoints,
  );
  expressApp.post(
    "/api/host/marina-management/images",
    verifyHostSession,
    handleManageHostMarinaImages,
  );
  expressApp.get("/api/host/guests", verifyHostSession, handleHostGuests);
  expressApp.get("/api/host/payments", verifyHostSession, handleHostPayments);
  expressApp.get(
    "/api/host/dashboard/stats",
    verifyHostSession,
    handleHostDashboardStats,
  );
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

  // Host management routes (admin functionality)
  expressApp.get(
    "/api/host/manage-hosts",
    verifyHostSession,
    handleGetManagedHosts,
  );
  expressApp.post("/api/host/assign-host", verifyHostSession, handleAssignHost);
  expressApp.put(
    "/api/host/update-host-role",
    verifyHostSession,
    handleUpdateHostRole,
  );
  expressApp.delete(
    "/api/host/remove-host",
    verifyHostSession,
    handleRemoveHost,
  );
  expressApp.post("/api/host/create-host", verifyHostSession, handleCreateHost);

  // New Admin Host Management routes
  expressApp.get("/api/admin/hosts", verifyHostSession, handleAdminGetHosts);
  expressApp.post("/api/admin/hosts", verifyHostSession, handleAdminCreateHost);
  expressApp.post(
    "/api/admin/hosts/assign",
    verifyHostSession,
    handleAdminAssignHost,
  );
  expressApp.put(
    "/api/admin/hosts/:hostId/role",
    verifyHostSession,
    handleAdminUpdateHostRole,
  );
  expressApp.delete(
    "/api/admin/hosts/:hostId",
    verifyHostSession,
    handleAdminRemoveHost,
  );

  // Marina routes (public)
  expressApp.post("/api/marina-registration", handleMarinaRegistration);
  expressApp.get("/api/marinas/search", handleMarinaSearch);
  expressApp.get("/api/marinas/filters", handleMarinaFilters);
  expressApp.get("/api/marinas/availability", handleMarinaAvailability);
  expressApp.get(
    "/api/marinas/popular-destinations",
    handlePopularDestinations,
  );
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

  // Environment keys routes
  expressApp.get("/api/payments/config", handleGetPaymentsConfig);
  expressApp.get(
    "/api/admin/environment-keys",
    verifyHostSession,
    handleGetEnvironmentKeys,
  );
  expressApp.post(
    "/api/admin/environment-keys",
    verifyHostSession,
    handleUpsertEnvironmentKey,
  );
  expressApp.delete(
    "/api/admin/environment-keys/:id",
    verifyHostSession,
    handleDeleteEnvironmentKey,
  );

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
