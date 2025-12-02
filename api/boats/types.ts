import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const boatTypes = await query(
      `SELECT 
        id,
        name,
        slug,
        description,
        is_active
      FROM boat_types
      WHERE is_active = 1
      ORDER BY name ASC`
    );

    return res.status(200).json({
      success: true,
      data: boatTypes,
    });
  } catch (error) {
    console.error("Error fetching boat types:", error);
    return res.status(500).json({ error: "Failed to fetch boat types" });
  }
}
