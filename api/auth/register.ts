// Register new user
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

async function generateToken(user: any): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
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
    const {
      email,
      full_name,
      date_of_birth,
      phone,
      phone_code,
      country_code,
      user_type = "guest",
    } = req.body;

    if (!email || !full_name) {
      return res
        .status(400)
        .json({ error: "Email and full name are required" });
    }

    // Check if user already exists
    const existing = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create Stripe customer
    let stripeCustomerId = null;
    try {
      const customer = await stripe.customers.create({
        email,
        name: full_name,
        metadata: {
          source: "docknow",
        },
      });
      stripeCustomerId = customer.id;
    } catch (stripeError) {
      console.error("Stripe customer creation error:", stripeError);
    }

    // Insert user
    const result = await query(
      `INSERT INTO users 
       (email, full_name, date_of_birth, phone, phone_code, country_code, user_type, stripe_customer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        full_name,
        date_of_birth,
        phone,
        phone_code,
        country_code,
        user_type,
        stripeCustomerId,
      ]
    );

    const userId = result.insertId;

    // Generate token
    const user = {
      id: userId,
      email,
      name: full_name,
      user_type,
    };

    const token = await generateToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
}
