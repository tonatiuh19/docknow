import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

interface BlockedDate {
  marinaId: number;
  slipId?: number | null; // null = block entire marina, number = block specific slip
  blockedDate: string;
  reason?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // POST - Create blocked date(s)
  if (req.method === "POST") {
    try {
      const {
        marinaId,
        slipId, // null = block entire marina, number = block specific slip
        slipIds, // array of slip IDs to block
        blockedDate,
        blockedDates,
        reason,
        userId,
        isAllDay,
        startTime,
        endTime,
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "User authentication required",
        });
      }

      // Handle single date
      if (blockedDate) {
        if (!marinaId || !blockedDate) {
          return res.status(400).json({
            success: false,
            error: "Marina ID and blocked date are required",
          });
        }

        const allDay = isAllDay === undefined || isAllDay === true ? 1 : 0;
        const start = allDay ? null : startTime;
        const end = allDay ? null : endTime;

        // Validate time range for partial day blocks
        if (!allDay && (!startTime || !endTime)) {
          return res.status(400).json({
            success: false,
            error:
              "Start time and end time are required for partial day blocks",
          });
        }

        // If slipIds array is provided, create individual records for each slip
        if (slipIds && Array.isArray(slipIds) && slipIds.length > 0) {
          for (const slip of slipIds) {
            await query(
              `INSERT INTO blocked_dates (marina_id, slip_id, blocked_date, reason, created_by, is_all_day, start_time, end_time) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                marinaId,
                slip,
                blockedDate,
                reason || "Unavailable",
                userId,
                allDay,
                start,
                end,
              ]
            );
          }
        } else {
          // Single slip or marina-wide block
          await query(
            `INSERT INTO blocked_dates (marina_id, slip_id, blocked_date, reason, created_by, is_all_day, start_time, end_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              marinaId,
              slipId || null, // null blocks entire marina
              blockedDate,
              reason || "Unavailable",
              userId,
              allDay,
              start,
              end,
            ]
          );
        }

        return res.status(201).json({
          success: true,
          data: { message: "Blocked date created successfully" },
        });
      }

      // Handle multiple dates
      if (blockedDates && Array.isArray(blockedDates)) {
        if (!marinaId) {
          return res.status(400).json({
            success: false,
            error: "Marina ID is required",
          });
        }

        for (const dateItem of blockedDates) {
          const date =
            typeof dateItem === "string" ? dateItem : dateItem.blockedDate;
          const itemReason =
            typeof dateItem === "object" ? dateItem.reason : reason;
          const itemIsAllDay =
            typeof dateItem === "object" && dateItem.isAllDay !== undefined
              ? dateItem.isAllDay
              : true;
          const itemStartTime =
            typeof dateItem === "object" ? dateItem.startTime : null;
          const itemEndTime =
            typeof dateItem === "object" ? dateItem.endTime : null;
          const itemSlipId =
            typeof dateItem === "object" ? dateItem.slipId : slipId;
          const itemSlipIds =
            typeof dateItem === "object" ? dateItem.slipIds : slipIds;

          const allDay = itemIsAllDay ? 1 : 0;
          const start = allDay ? null : itemStartTime;
          const end = allDay ? null : itemEndTime;

          // Validate time range for partial day blocks
          if (!allDay && (!itemStartTime || !itemEndTime)) {
            continue; // Skip invalid entries
          }

          // If slipIds array is provided, create individual records for each slip
          if (
            itemSlipIds &&
            Array.isArray(itemSlipIds) &&
            itemSlipIds.length > 0
          ) {
            for (const slip of itemSlipIds) {
              await query(
                `INSERT INTO blocked_dates (marina_id, slip_id, blocked_date, reason, created_by, is_all_day, start_time, end_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  marinaId,
                  slip,
                  date,
                  itemReason || "Unavailable",
                  userId,
                  allDay,
                  start,
                  end,
                ]
              );
            }
          } else {
            // Single slip or marina-wide block
            await query(
              `INSERT INTO blocked_dates (marina_id, slip_id, blocked_date, reason, created_by, is_all_day, start_time, end_time) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                marinaId,
                itemSlipId || null,
                date,
                itemReason || "Unavailable",
                userId,
                allDay,
                start,
                end,
              ]
            );
          }
        }

        return res.status(201).json({
          success: true,
          data: {
            message: `Blocked dates created successfully`,
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: "Invalid request format",
      });
    } catch (error) {
      console.error("Error creating blocked dates:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create blocked dates",
      });
    }
  }

  // DELETE - Remove blocked date
  if (req.method === "DELETE") {
    try {
      const { id, marinaId, blockedDate } = req.query;

      if (id) {
        await query(`DELETE FROM blocked_dates WHERE id = ?`, [id]);
      } else if (marinaId && blockedDate) {
        await query(
          `DELETE FROM blocked_dates WHERE marina_id = ? AND blocked_date = ?`,
          [marinaId, blockedDate]
        );
      } else {
        return res.status(400).json({
          success: false,
          error: "Either ID or marina ID and blocked date are required",
        });
      }

      return res.status(200).json({
        success: true,
        data: { message: "Blocked date deleted successfully" },
      });
    } catch (error) {
      console.error("Error deleting blocked date:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete blocked date",
      });
    }
  }

  // GET - Fetch blocked dates
  if (req.method === "GET") {
    try {
      const { marinaId } = req.query;

      if (!marinaId) {
        return res.status(400).json({
          success: false,
          error: "Marina ID is required",
        });
      }

      const results = await query(
        `SELECT 
          bd.id, 
          bd.marina_id as marinaId,
          bd.slip_id as slipId,
          bd.blocked_date as blockedDate, 
          bd.reason, 
          bd.is_all_day as isAllDay,
          bd.start_time as startTime,
          bd.end_time as endTime,
          bd.created_by as createdBy, 
          bd.created_at as createdAt,
          s.slip_number as slipNumber,
          s.length_meters as slipLength,
          s.price_per_day as slipPrice
         FROM blocked_dates bd
         LEFT JOIN slips s ON bd.slip_id = s.id
         WHERE bd.marina_id = ? AND bd.blocked_date >= CURDATE()
         ORDER BY bd.blocked_date ASC, bd.start_time ASC, s.slip_number ASC`,
        [marinaId]
      );

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch blocked dates",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method not allowed",
  });
}
