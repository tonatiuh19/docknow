// Helper functions for visitor tracking
import { query } from "../../src/lib/db";
import type { VercelRequest } from "@vercel/node";

interface TrackingData {
  sessionId: string;
  userId?: number;
  marinaId?: number;
  slipId?: number;
  bookingId?: number;
  req: VercelRequest;
}

// Get or create visitor session
export async function getOrCreateSession(
  sessionId: string,
  userId: number | null,
  marinaId: number | null,
  req: VercelRequest
): Promise<void> {
  try {
    const session = await query(
      "SELECT id FROM visitor_sessions WHERE session_id = ?",
      [sessionId]
    );

    if (!session || session.length === 0) {
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        (req.headers["x-real-ip"] as string) ||
        "unknown";
      const userAgent = req.headers["user-agent"] || "";
      const referrer = req.headers["referer"] || null;

      await query(
        `INSERT INTO visitor_sessions 
        (session_id, user_id, marina_id, ip_address, user_agent, referrer, started_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [sessionId, userId, marinaId, ipAddress, userAgent, referrer]
      );
    } else if (userId) {
      await query(
        "UPDATE visitor_sessions SET user_id = ?, last_activity_at = NOW() WHERE session_id = ?",
        [userId, sessionId]
      );
    } else {
      await query(
        "UPDATE visitor_sessions SET last_activity_at = NOW() WHERE session_id = ?",
        [sessionId]
      );
    }
  } catch (error) {
    console.error("Session tracking error:", error);
  }
}

// Track page view
export async function trackPageView(
  sessionId: string,
  marinaId: number | null,
  pageUrl: string,
  pageType: string = "other"
): Promise<void> {
  try {
    await query(
      `INSERT INTO visitor_page_views 
      (session_id, marina_id, page_url, page_type, viewed_at) 
      VALUES (?, ?, ?, ?, NOW())`,
      [sessionId, marinaId, pageUrl, pageType]
    );
  } catch (error) {
    console.error("Page view tracking error:", error);
  }
}

// Track checkout event
export async function trackCheckoutEvent(data: {
  sessionId: string;
  userId?: number;
  marinaId: number;
  slipId?: number;
  eventType: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalAmount?: number;
  bookingId?: number;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO visitor_checkout_events 
      (session_id, user_id, marina_id, slip_id, event_type, check_in_date, check_out_date, total_amount, booking_id, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.sessionId,
        data.userId || null,
        data.marinaId,
        data.slipId || null,
        data.eventType,
        data.checkInDate || null,
        data.checkOutDate || null,
        data.totalAmount || null,
        data.bookingId || null,
      ]
    );
  } catch (error) {
    console.error("Checkout event tracking error:", error);
  }
}

// Track interaction
export async function trackInteraction(
  sessionId: string,
  marinaId: number | null,
  interactionType: string,
  interactionData: any = {}
): Promise<void> {
  try {
    await query(
      `INSERT INTO visitor_interactions 
      (session_id, marina_id, interaction_type, interaction_data, created_at) 
      VALUES (?, ?, ?, ?, NOW())`,
      [sessionId, marinaId, interactionType, JSON.stringify(interactionData)]
    );
  } catch (error) {
    console.error("Interaction tracking error:", error);
  }
}
