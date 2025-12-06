import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await getBoats(req, res);
      case "POST":
        return await createBoat(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("Boats API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getBoats(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const boats = await query(
      `SELECT 
        b.id,
        b.owner_id,
        b.name,
        b.model,
        b.manufacturer,
        b.year,
        b.length_meters,
        b.width_meters,
        b.draft_meters,
        b.home_marina,
        b.registration_number,
        b.insurance_provider,
        b.insurance_policy_number,
        b.is_active,
        b.created_at,
        b.updated_at,
        bt.id as boat_type_id,
        bt.name as boat_type_name,
        bt.slug as boat_type_slug
      FROM boats b
      LEFT JOIN boat_types bt ON b.boat_type_id = bt.id
      WHERE b.owner_id = ? AND b.is_active = 1
      ORDER BY b.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: boats,
    });
  } catch (error) {
    console.error("Error fetching boats:", error);
    return res.status(500).json({ error: "Failed to fetch boats" });
  }
}

async function createBoat(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      ownerId,
      name,
      model,
      manufacturer,
      boatTypeId,
      year,
      lengthMeters,
      widthMeters,
      draftMeters,
      homeMarina,
      registrationNumber,
      insuranceProvider,
      insurancePolicyNumber,
    } = req.body;

    if (!ownerId || !name) {
      return res
        .status(400)
        .json({ error: "Owner ID and boat name are required" });
    }

    const result = await query(
      `INSERT INTO boats (
        owner_id,
        name,
        model,
        manufacturer,
        boat_type_id,
        year,
        length_meters,
        width_meters,
        draft_meters,
        home_marina,
        registration_number,
        insurance_provider,
        insurance_policy_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        name,
        model,
        manufacturer,
        boatTypeId,
        year,
        lengthMeters,
        widthMeters,
        draftMeters,
        homeMarina,
        registrationNumber,
        insuranceProvider,
        insurancePolicyNumber,
      ]
    );

    // Fetch the created boat with boat type information
    const boats = await query(
      `SELECT 
        b.id,
        b.owner_id,
        b.name,
        b.model,
        b.manufacturer,
        b.year,
        b.length_meters,
        b.width_meters,
        b.draft_meters,
        b.home_marina,
        b.registration_number,
        b.insurance_provider,
        b.insurance_policy_number,
        b.is_active,
        b.created_at,
        b.updated_at,
        bt.id as boat_type_id,
        bt.name as boat_type_name,
        bt.slug as boat_type_slug
      FROM boats b
      LEFT JOIN boat_types bt ON b.boat_type_id = bt.id
      WHERE b.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: boats[0],
      message: "Boat created successfully",
    });
  } catch (error) {
    console.error("Error creating boat:", error);
    return res.status(500).json({ error: "Failed to create boat" });
  }
}
