// Send verification code to guest
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

async function sendVerificationEmail(
  email: string,
  userName: string,
  code: string
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
    let transportConfig: any;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log(
        "⚠️  No SMTP credentials found. Using Ethereal test account..."
      );

      // Create test account on the fly (for development only)
      const testAccount = await nodemailer.createTestAccount();

      transportConfig = {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };

      console.log("📧 Ethereal test account created:");
      console.log("   User:", testAccount.user);
      console.log("   Pass:", testAccount.pass);
    } else {
      // Use configured SMTP settings (Hostgator)
      transportConfig = {
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
    }

    // Configure email transporter
    console.log("🔧 Creating transporter...");
    const transporter = nodemailer.createTransport(transportConfig);

    // Verify SMTP connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified!");

    // Email template
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 30px;
            font-size: 16px;
          }
          .code-container {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #06b6d4;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .code-label {
            color: #0891b2;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .code { 
            font-size: 42px; 
            font-weight: bold; 
            color: #0891b2; 
            letter-spacing: 8px; 
            font-family: 'Courier New', monospace;
            margin: 0;
          }
          .expiry {
            color: #6b7280;
            font-size: 14px;
            margin-top: 15px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
            color: #92400e;
            font-size: 14px;
          }
          .footer { 
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
          }
          .footer a {
            color: #06b6d4;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DockNow</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p class="message">
              Welcome to DockNow! To complete your sign-in, please use the verification code below:
            </p>
            <div class="code-container">
              <div class="code-label">Your Verification Code</div>
              <p class="code">${code}</p>
              <p class="expiry">This code will expire in 15 minutes</p>
            </div>
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request this code, please ignore this email. Never share your verification code with anyone.
            </div>
            <p class="message">
              Thank you for choosing DockNow for your marina booking needs!
            </p>
          </div>
          <div class="footer">
            <p><strong>DockNow</strong> - Your Marina Booking Solution</p>
            <p>&copy; ${new Date().getFullYear()} DockNow. All rights reserved.</p>
            <p>
              Need help? Contact us at <a href="mailto:support@docknow.app">support@docknow.app</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("📤 Sending email to:", email);
    console.log(
      "   From field:",
      process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`
    );
    console.log("   Subject:", `${code} is your DockNow verification code`);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"DockNow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} is your DockNow verification code`,
      html: emailBody,
      text: `Hi ${userName},\n\nWelcome to DockNow! Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nThank you,\nDockNow Team`,
    });

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", JSON.stringify(info.response || "No response"));
    console.log("   Envelope:", JSON.stringify(info.envelope || "No envelope"));
    console.log("   Accepted:", JSON.stringify(info.accepted || []));
    console.log("   Rejected:", JSON.stringify(info.rejected || []));

    // If using Ethereal (test mode), log the preview URL
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      const previewUrl = nodemailer.getTestMessageUrl(info as any);
      console.log("📬 Preview URL:", previewUrl);
      console.log("🔑 Verification code:", code);
    } else {
      // Production mode - log additional debug info
      console.log("🏭 PRODUCTION EMAIL SENT:");
      console.log("   Production SMTP used:", transportConfig.host);
      console.log("   Target email:", email);
      console.log("   User name:", userName);
      console.log("   Verification code:", code);
      console.log("   Environment check:");
      console.log("     NODE_ENV:", process.env.NODE_ENV);
      console.log("     SMTP_FROM:", process.env.SMTP_FROM || "NOT SET");
    }

    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔵 sendGuestCode endpoint called");
    console.log("   Request body:", req.body);

    const { userId, email } = req.body;

    if (!userId || !email) {
      console.log("❌ Missing userId or email");
      return res.status(400).json({ error: "User ID and email are required" });
    }

    console.log("   User ID:", userId);
    console.log("   Email:", email);

    // Get user info
    console.log("📊 Querying user from database...");
    const users = await query<any[]>(
      "SELECT id, email, full_name, is_active FROM users WHERE id = ? AND email = ?",
      [userId, email]
    );

    if (users.length === 0) {
      console.log("❌ User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    const userName = user.full_name || "Guest";
    console.log("✅ User found:", userName);

    if (!user.is_active) {
      console.log("❌ User account is not active");
      return res.status(403).json({ error: "User account is not active" });
    }

    // Delete old sessions for this user
    console.log("🗑️  Deleting old session codes...");
    await query("DELETE FROM user_sessions WHERE user_id = ?", [userId]);

    // Generate unique random 6-digit code
    console.log("🔢 Generating unique verification code...");
    let code: string;
    let isUnique = false;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existingCodes = await query<any[]>(
        "SELECT COUNT(*) as count FROM user_sessions WHERE verification_code = ?",
        [code]
      );
      isUnique = existingCodes.length === 0 || existingCodes[0].count === 0;
    } while (!isUnique);
    console.log("✅ Generated unique code");

    // Set expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Create new session
    console.log("💾 Inserting session code into database...");
    await query(
      `INSERT INTO user_sessions (user_id, verification_code, expires_at, is_verified)
       VALUES (?, ?, ?, 0)`,
      [userId, code, expiresAt]
    );
    console.log("✅ Session code saved");

    // Send verification email
    console.log("📧 Calling sendVerificationEmail...");
    const emailSent = await sendVerificationEmail(email, userName, code);

    if (emailSent) {
      console.log("✅ Email sent successfully");
      res.status(200).json({
        success: true,
        message: "Verification code sent",
        expiresAt,
        // Remove this in production - only for testing
        debug_code: process.env.NODE_ENV === "development" ? code : undefined,
      });
    } else {
      console.log("❌ Email sending failed");
      res.status(500).json({
        success: false,
        error: "Failed to send verification code",
      });
    }
  } catch (error) {
    console.error("❌ Send guest code error:", error);
    if (error instanceof Error) {
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
    }
    return res.status(500).json({ error: "Failed to send verification code" });
  }
}
