import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { marinaId, checkIn, checkOut, boatLength, boatWidth, boatDraft } =
      req.query;

    // Validation
    if (!marinaId || !checkIn || !checkOut || !boatLength) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required parameters: marinaId, checkIn, checkOut, boatLength",
      });
    }

    // Call the stored procedure to get available slips
    const availableSlips = await query(
      `SELECT 
        s.id,
        s.slip_number,
        s.length_meters,
        s.width_meters,
        s.depth_meters,
        s.price_per_day,
        s.has_power,
        s.has_water,
        s.power_capacity_amps
      FROM slips s
      LEFT JOIN bookings b ON s.id = b.slip_id
        AND b.status IN ('confirmed', 'pending')
        AND (
          (b.check_in_date <= ? AND b.check_out_date >= ?) OR
          (b.check_in_date <= ? AND b.check_out_date >= ?) OR
          (b.check_in_date >= ? AND b.check_out_date <= ?)
        )
      LEFT JOIN blocked_dates bd ON (
        (bd.slip_id = s.id OR (bd.slip_id IS NULL AND bd.marina_id = s.marina_id))
        AND bd.blocked_date BETWEEN ? AND ?
      )
      WHERE s.marina_id = ?
        AND s.is_available = 1
        AND s.length_meters >= ?
      GROUP BY s.id, s.slip_number, s.length_meters, s.width_meters, 
               s.depth_meters, s.price_per_day, s.has_power, s.has_water, 
               s.power_capacity_amps
      HAVING COUNT(DISTINCT b.id) = 0 AND COUNT(DISTINCT bd.id) = 0
      ORDER BY s.price_per_day ASC, s.length_meters ASC`,
      [
        checkIn,
        checkIn,
        checkOut,
        checkOut,
        checkIn,
        checkOut,
        checkIn,
        checkOut,
        parseInt(marinaId as string),
        parseFloat(boatLength as string),
      ]
    );

    // The query returns results directly
    const slips = availableSlips || [];

    // Filter by boat dimensions if provided
    const filteredSlips = slips.filter((slip: any) => {
      // Check length
      if (parseFloat(boatLength as string) > slip.length_meters) {
        return false;
      }

      // Check width if provided
      if (boatWidth && parseFloat(boatWidth as string) > slip.width_meters) {
        return false;
      }

      // Check draft if provided
      if (
        boatDraft &&
        slip.depth_meters &&
        parseFloat(boatDraft as string) > slip.depth_meters
      ) {
        return false;
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      data: {
        availableCount: filteredSlips.length,
        slips: filteredSlips,
        searchParams: {
          marinaId,
          checkIn,
          checkOut,
          boatLength,
          boatWidth,
          boatDraft,
        },
      },
    });
  } catch (error: any) {
    console.error("Error checking slip availability:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check slip availability",
      details: error.message,
    });
  }
}
