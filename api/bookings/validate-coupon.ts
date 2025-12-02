import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { code, marinaId, days } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    // Query for the coupon
    const coupons = await query(
      `SELECT 
        id,
        code,
        description,
        discount_type,
        discount_value,
        min_days,
        max_uses,
        times_used,
        valid_from,
        valid_until,
        marina_id
      FROM coupons
      WHERE code = ? AND is_active = 1`,
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    const coupon = coupons[0];

    // Validate marina-specific coupon
    if (coupon.marina_id && coupon.marina_id !== marinaId) {
      return res.status(400).json({
        error: "This coupon is not valid for this marina",
      });
    }

    // Validate dates
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom || now > validUntil) {
      return res.status(400).json({ error: "This coupon has expired" });
    }

    // Validate minimum days
    if (coupon.min_days && days < coupon.min_days) {
      return res.status(400).json({
        error: `This coupon requires a minimum of ${coupon.min_days} days`,
      });
    }

    // Validate usage limit
    if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
      return res.status(400).json({
        error: "This coupon has reached its usage limit",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_days: coupon.min_days,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return res.status(500).json({ error: "Failed to validate coupon" });
  }
}
