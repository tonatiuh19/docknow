// API: Get visitor analytics for host's marinas
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

interface VisitorStats {
  date: string;
  total_visitors: number;
  logged_in_visitors: number;
  anonymous_visitors: number;
  checkout_started: number;
  bookings_completed: number;
  checkouts_abandoned: number;
  conversion_rate: number;
}

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

    const { startDate, endDate, marinaId, period = "30" } = req.query;

    // Calculate date range
    const endDateStr =
      (endDate as string) || new Date().toISOString().split("T")[0];
    const startDateStr =
      (startDate as string) ||
      new Date(Date.now() - parseInt(period as string) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Get daily analytics from view
    let analyticsQuery = `
      SELECT 
        visit_date,
        marina_id,
        marina_name,
        total_visitors,
        logged_in_visitors,
        anonymous_visitors,
        checkout_started,
        bookings_completed,
        checkouts_abandoned,
        conversion_rate
      FROM visitor_analytics_summary
      WHERE marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
        AND visit_date BETWEEN ? AND ?
    `;

    const params: any[] = [authHost.id, startDateStr, endDateStr];

    if (marinaId) {
      analyticsQuery += " AND marina_id = ?";
      params.push(marinaId);
    }

    analyticsQuery += " ORDER BY visit_date DESC";

    const dailyStats = await query<VisitorStats[]>(analyticsQuery, params);

    // Get overall summary
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT vs.session_id) as total_sessions,
        COUNT(DISTINCT vs.user_id) as unique_users,
        COUNT(DISTINCT CASE WHEN vs.user_id IS NOT NULL THEN vs.session_id END) as logged_in_sessions,
        COUNT(DISTINCT vpv.id) as total_page_views,
        ROUND(AVG(vpv.time_spent_seconds), 2) as avg_time_per_page,
        COUNT(DISTINCT CASE WHEN vce.event_type = 'checkout_started' THEN vce.session_id END) as total_checkout_started,
        COUNT(DISTINCT CASE WHEN vce.event_type = 'booking_completed' THEN vce.session_id END) as total_bookings_completed,
        COUNT(DISTINCT CASE WHEN vce.event_type = 'checkout_abandoned' THEN vce.session_id END) as total_checkouts_abandoned,
        ROUND(
          COUNT(DISTINCT CASE WHEN vce.event_type = 'booking_completed' THEN vce.session_id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT CASE WHEN vce.event_type = 'checkout_started' THEN vce.session_id END), 0),
          2
        ) as overall_conversion_rate
      FROM visitor_sessions vs
      LEFT JOIN visitor_page_views vpv ON vs.session_id = vpv.session_id
      LEFT JOIN visitor_checkout_events vce ON vs.session_id = vce.session_id
      WHERE vs.marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
        AND DATE(vs.started_at) BETWEEN ? AND ?
      ${marinaId ? "AND vs.marina_id = ?" : ""}
    `;

    const summaryParams = marinaId ? [...params] : params;
    const summary = await query(summaryQuery, summaryParams);

    // Get top pages
    const topPagesQuery = `
      SELECT 
        vpv.page_type,
        COUNT(*) as view_count,
        ROUND(AVG(vpv.time_spent_seconds), 2) as avg_time_spent
      FROM visitor_page_views vpv
      INNER JOIN visitor_sessions vs ON vpv.session_id = vs.session_id
      WHERE vs.marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
        AND DATE(vpv.viewed_at) BETWEEN ? AND ?
        ${marinaId ? "AND vpv.marina_id = ?" : ""}
      GROUP BY vpv.page_type
      ORDER BY view_count DESC
      LIMIT 10
    `;

    const topPages = await query(topPagesQuery, summaryParams);

    // Get checkout funnel data
    const funnelQuery = `
      SELECT 
        vce.checkout_step,
        vce.event_type,
        COUNT(DISTINCT vce.session_id) as session_count
      FROM visitor_checkout_events vce
      WHERE vce.marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
        AND DATE(vce.created_at) BETWEEN ? AND ?
        ${marinaId ? "AND vce.marina_id = ?" : ""}
      GROUP BY vce.checkout_step, vce.event_type
      ORDER BY vce.checkout_step, vce.event_type
    `;

    const checkoutFunnel = await query(funnelQuery, summaryParams);

    // Get recent visitor details (last 50)
    const recentVisitorsQuery = `
      SELECT 
        vs.session_id,
        vs.user_id,
        u.full_name as user_name,
        u.email as user_email,
        m.name as marina_name,
        vs.device_type,
        vs.browser,
        vs.country_code,
        vs.city,
        vs.started_at,
        vs.last_activity_at,
        TIMESTAMPDIFF(SECOND, vs.started_at, vs.last_activity_at) as session_duration,
        (SELECT COUNT(*) FROM visitor_page_views WHERE session_id = vs.session_id) as pages_viewed,
        (SELECT event_type FROM visitor_checkout_events WHERE session_id = vs.session_id ORDER BY created_at DESC LIMIT 1) as last_checkout_event
      FROM visitor_sessions vs
      LEFT JOIN users u ON vs.user_id = u.id
      LEFT JOIN marinas m ON vs.marina_id = m.id
      WHERE vs.marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
        AND DATE(vs.started_at) BETWEEN ? AND ?
        ${marinaId ? "AND vs.marina_id = ?" : ""}
      ORDER BY vs.started_at DESC
      LIMIT 50
    `;

    const recentVisitors = await query(recentVisitorsQuery, summaryParams);

    // Get device breakdown
    const deviceBreakdownQuery = `
      SELECT 
        vs.device_type,
        COUNT(DISTINCT vs.session_id) as session_count,
        ROUND(COUNT(DISTINCT vs.session_id) * 100.0 / (
          SELECT COUNT(DISTINCT session_id) 
          FROM visitor_sessions 
          WHERE marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
            AND DATE(started_at) BETWEEN ? AND ?
            ${marinaId ? "AND marina_id = ?" : ""}
        ), 2) as percentage
      FROM visitor_sessions vs
      WHERE vs.marina_id IN (SELECT id FROM marinas WHERE host_id = ?)
        AND DATE(vs.started_at) BETWEEN ? AND ?
        ${marinaId ? "AND vs.marina_id = ?" : ""}
      GROUP BY vs.device_type
    `;

    const deviceParams = marinaId
      ? [
          authHost.id,
          startDateStr,
          endDateStr,
          marinaId,
          authHost.id,
          startDateStr,
          endDateStr,
          marinaId,
        ]
      : [
          authHost.id,
          startDateStr,
          endDateStr,
          authHost.id,
          startDateStr,
          endDateStr,
        ];

    const deviceBreakdown = await query(deviceBreakdownQuery, deviceParams);

    return res.status(200).json({
      dateRange: { start: startDateStr, end: endDateStr },
      summary: summary[0] || {},
      dailyStats,
      topPages,
      checkoutFunnel,
      recentVisitors,
      deviceBreakdown,
    });
  } catch (error) {
    console.error("Visitor analytics error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
