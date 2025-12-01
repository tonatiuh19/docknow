import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

interface BookedDate {
  checkIn: string;
  checkOut: string;
}

interface BlockedDate {
  date: string;
  reason: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  slipId?: number | null; // null = entire marina blocked, number = specific slip
  slipNumber?: string;
}

interface Slip {
  id: number;
  slipNumber: string;
  length: number;
  width: number;
  depth: number;
  pricePerDay: number;
  isAvailable: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: {
    bookedDates: BookedDate[];
    blockedDates: BlockedDate[];
    availableSlips: Slip[];
  };
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  const { marinaId } = req.query;

  if (!marinaId || Array.isArray(marinaId)) {
    return res.status(400).json({
      success: false,
      error: "Marina ID is required",
    });
  }

  try {
    // Fetch booked dates from bookings table
    // Only get confirmed and pending bookings (not cancelled or completed past dates)
    const bookingResults = await query(
      `SELECT 
        check_in_date as checkIn,
        check_out_date as checkOut
       FROM bookings
       WHERE marina_id = ? 
       AND status IN ('confirmed', 'pending')
       AND check_out_date >= CURDATE()
       ORDER BY check_in_date ASC`,
      [marinaId]
    );

    // Fetch blocked dates from blocked_dates table with slip information
    let blockedResults: any[] = [];
    try {
      blockedResults = await query(
        `SELECT 
          bd.blocked_date as date,
          bd.reason,
          bd.is_all_day as isAllDay,
          bd.start_time as startTime,
          bd.end_time as endTime,
          bd.slip_id as slipId,
          s.slip_number as slipNumber
         FROM blocked_dates bd
         LEFT JOIN slips s ON bd.slip_id = s.id
         WHERE bd.marina_id = ? 
         AND bd.blocked_date >= CURDATE()
         ORDER BY bd.blocked_date ASC, bd.start_time ASC`,
        [marinaId]
      );
    } catch (err) {
      // Table might not exist, that's okay
      console.log("blocked_dates table not found, using empty array");
    }

    // Fetch available slips for the marina
    let availableSlips: any[] = [];
    try {
      availableSlips = await query(
        `SELECT 
          id,
          slip_number as slipNumber,
          length_meters as length,
          width_meters as width,
          depth_meters as depth,
          price_per_day as pricePerDay,
          is_available as isAvailable
         FROM slips
         WHERE marina_id = ? 
         AND is_available = 1
         ORDER BY slip_number ASC`,
        [marinaId]
      );
    } catch (err) {
      console.log("slips table not found, using empty array");
    }

    const bookedDates: BookedDate[] = (bookingResults as any[]).map((row) => ({
      checkIn: row.checkIn,
      checkOut: row.checkOut,
    }));

    const blockedDates: BlockedDate[] = (blockedResults as any[]).map(
      (row) => ({
        date: row.date,
        reason: row.reason || "Unavailable",
        isAllDay: row.isAllDay,
        startTime: row.startTime,
        endTime: row.endTime,
        slipId: row.slipId,
        slipNumber: row.slipNumber,
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        bookedDates,
        blockedDates,
        availableSlips,
      },
    });
  } catch (error) {
    console.error("Error fetching booking availability:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch booking availability",
    });
  }
}
