// Send verification code to host
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

async function sendHostVerificationEmail(
  email: string,
  hostName: string,
  code: string
): Promise<boolean> {
  try {
    let transportConfig: any;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
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
    } else {
      transportConfig = {
        host: process.env.SMTP_HOST || "mail.garbrix.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);
    await transporter.verify();

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
            background: linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
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
            background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
            border: 2px solid #0891b2;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .code-label {
            color: #0c4a6e;
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
            border-radius: 8px;
            margin: 20px 0;
          }
          .warning p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .footer a {
            color: #0891b2;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 DockNow Host Portal</h1>
            <p>Marina Management System</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello ${hostName},
            </div>
            
            <div class="message">
              You're accessing the DockNow Host Portal. Please use the verification code below to complete your login:
            </div>
            
            <div class="code-container">
              <div class="code-label">Your Verification Code</div>
              <p class="code">${code}</p>
              <div class="expiry">⏱️ This code will expire in 15 minutes</div>
            </div>
            
            <div class="warning">
              <p>🔒 <strong>Security Notice:</strong> Never share this code with anyone. DockNow staff will never ask for your verification code.</p>
            </div>
            
            <div class="message">
              If you didn't request this code, please ignore this email or contact our support team if you have concerns about your account security.
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} DockNow. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@docknow.com">Contact Support</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from:
        process.env.SMTP_FROM || '"DockNow Host Portal" <noreply@docknow.com>',
      to: email,
      subject: `Your DockNow Host Portal Verification Code: ${code}`,
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Host verification email sent:", info.messageId);

    return true;
  } catch (error) {
    console.error("Failed to send host verification email:", error);
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if host exists
    const hosts = await query(
      "SELECT id, email, full_name, is_active FROM hosts WHERE email = ?",
      [email]
    );

    if (hosts.length === 0) {
      return res.status(404).json({ error: "Host account not found" });
    }

    const host = hosts[0];

    if (!host.is_active) {
      return res.status(403).json({ error: "Host account is inactive" });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create session (expires in 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `INSERT INTO host_sessions (host_id, verification_code, is_verified, expires_at)
       VALUES (?, ?, FALSE, ?)`,
      [host.id, code, expiresAt]
    );

    // Send email
    const emailSent = await sendHostVerificationEmail(
      email,
      host.full_name,
      code
    );

    if (!emailSent) {
      console.error("Failed to send verification email, but session created");
    }

    return res.status(200).json({
      message: "Verification code sent successfully",
      email: email,
      // In development, include code for testing
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  } catch (error) {
    console.error("Send host code error:", error);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
}
