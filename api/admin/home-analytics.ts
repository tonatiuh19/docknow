// API: Get home visitor analytics (admin only)
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

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
    const { startDate, endDate, period = "30" } = req.query;

    // Calculate date range
    const endDateStr =
      (endDate as string) || new Date().toISOString().split("T")[0];
    const startDateStr =
      (startDate as string) ||
      new Date(Date.now() - parseInt(period as string) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Get summary statistics
    const summaryResult = await query(
      `SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_visitors,
        SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_visits,
        SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_visits,
        SUM(CASE WHEN device_type = 'tablet' THEN 1 ELSE 0 END) as tablet_visits,
        COUNT(DISTINCT country_code) as countries_count,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM home_visitors
      WHERE DATE(visited_at) BETWEEN ? AND ?`,
      [startDateStr, endDateStr]
    );

    // Get daily statistics
    const dailyStatsResult = await query(
      `SELECT * FROM home_visitor_stats
       WHERE visit_date BETWEEN ? AND ?
       ORDER BY visit_date DESC`,
      [startDateStr, endDateStr]
    );

    // Get top referrers
    const topReferrersResult = await query(
      `SELECT 
        referrer,
        COUNT(*) as visit_count,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM home_visitors
      WHERE DATE(visited_at) BETWEEN ? AND ?
        AND referrer IS NOT NULL 
        AND referrer != ''
      GROUP BY referrer
      ORDER BY visit_count DESC
      LIMIT 10`,
      [startDateStr, endDateStr]
    );

    // Get top countries
    const topCountriesResult = await query(
      `SELECT 
        country_code,
        city,
        COUNT(*) as visit_count,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM home_visitors
      WHERE DATE(visited_at) BETWEEN ? AND ?
        AND country_code IS NOT NULL
      GROUP BY country_code, city
      ORDER BY visit_count DESC
      LIMIT 10`,
      [startDateStr, endDateStr]
    );

    // Get browser breakdown
    const browserBreakdownResult = await query(
      `SELECT 
        browser,
        COUNT(*) as visit_count,
        COUNT(DISTINCT session_id) as unique_visitors,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM home_visitors WHERE DATE(visited_at) BETWEEN ? AND ?), 2) as percentage
      FROM home_visitors
      WHERE DATE(visited_at) BETWEEN ? AND ?
        AND browser IS NOT NULL
      GROUP BY browser
      ORDER BY visit_count DESC`,
      [startDateStr, endDateStr, startDateStr, endDateStr]
    );

    // Get recent visitors (last 50)
    const recentVisitorsResult = await query(
      `SELECT 
        session_id,
        ip_address,
        country_code,
        city,
        device_type,
        browser,
        os,
        referrer,
        landing_page,
        visited_at
      FROM home_visitors
      WHERE DATE(visited_at) BETWEEN ? AND ?
      ORDER BY visited_at DESC
      LIMIT 50`,
      [startDateStr, endDateStr]
    );

    const summary = summaryResult[0];
    const response = {
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
      summary: {
        total_visits: parseInt(summary.total_visits) || 0,
        unique_visitors: parseInt(summary.unique_visitors) || 0,
        desktop_visits: parseInt(summary.desktop_visits) || 0,
        mobile_visits: parseInt(summary.mobile_visits) || 0,
        tablet_visits: parseInt(summary.tablet_visits) || 0,
        countries_count: parseInt(summary.countries_count) || 0,
        unique_ips: parseInt(summary.unique_ips) || 0,
      },
      dailyStats: dailyStatsResult,
      topReferrers: topReferrersResult,
      topCountries: topCountriesResult,
      browserBreakdown: browserBreakdownResult,
      recentVisitors: recentVisitorsResult,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Home visitor analytics error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
