// Register new guest user
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";

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
    const { email, fullName, phone, phoneCode, countryCode, dateOfBirth } =
      req.body;

    // Validate required fields
    if (
      !email ||
      !fullName ||
      !phone ||
      !phoneCode ||
      !countryCode ||
      !dateOfBirth
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate age (must be at least 18)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      return res
        .status(400)
        .json({ error: "You must be at least 18 years old" });
    }

    // Check if user already exists
    const existingUsers = await query<any[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Insert new user
    const result = await query<any>(
      `INSERT INTO users (email, full_name, phone, phone_code, country_code, date_of_birth, user_type, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, 'guest', 1, 0)`,
      [email, fullName, phone, phoneCode, countryCode, dateOfBirth]
    );

    const userId = result.insertId;

    return res.status(201).json({
      success: true,
      userId,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register guest error:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
}
