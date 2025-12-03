// Get payment/revenue data for host's marinas
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify host token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const verified = await jwtVerify(token, JWT_SECRET);
    const authHost = verified.payload.host as any;

    const { startDate, endDate, marinaId } = req.query;

    let queryStr = `
      SELECT b.id, b.check_in_date, b.check_out_date, b.total_amount, 
             b.subtotal, b.service_fee, b.status, b.created_at,
             m.name as marina_name,
             s.slip_number,
             u.full_name as guest_name
      FROM bookings b
      INNER JOIN marinas m ON b.marina_id = m.id
      LEFT JOIN slips s ON b.slip_id = s.id
      INNER JOIN users u ON b.user_id = u.id
      WHERE m.host_id = ? AND b.status = 'confirmed'
    `;

    const params: any[] = [authHost.id];

    if (marinaId) {
      queryStr += " AND b.marina_id = ?";
      params.push(marinaId);
    }

    if (startDate) {
      queryStr += " AND b.created_at >= ?";
      params.push(startDate);
    }

    if (endDate) {
      queryStr += " AND b.created_at <= ?";
      params.push(endDate);
    }

    queryStr += " ORDER BY b.created_at DESC";

    const payments = await query(queryStr, params);

    // Calculate totals
    const totals = {
      total_revenue: payments.reduce(
        (sum: number, p: any) => sum + parseFloat(p.subtotal || 0),
        0
      ),
      service_fees: payments.reduce(
        (sum: number, p: any) => sum + parseFloat(p.service_fee || 0),
        0
      ),
      net_revenue: payments.reduce(
        (sum: number, p: any) => sum + parseFloat(p.subtotal || 0),
        0
      ),
      transaction_count: payments.length,
    };

    return res.status(200).json({ payments, totals });
  } catch (error) {
    console.error("Payment data error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
