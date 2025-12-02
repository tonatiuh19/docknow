import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: "Boat ID is required" });
  }

  try {
    switch (method) {
      case "GET":
        return await getBoat(req, res, id);
      case "PUT":
        return await updateBoat(req, res, id);
      case "DELETE":
        return await deleteBoat(req, res, id);
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("Boat API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getBoat(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const boats = await query(
      `SELECT 
        b.id,
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
      WHERE b.id = ? AND b.is_active = 1`,
      [id]
    );

    if (boats.length === 0) {
      return res.status(404).json({ error: "Boat not found" });
    }

    return res.status(200).json({
      success: true,
      data: boats[0],
    });
  } catch (error) {
    console.error("Error fetching boat:", error);
    return res.status(500).json({ error: "Failed to fetch boat" });
  }
}

async function updateBoat(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    const {
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

    await query(
      `UPDATE boats SET
        name = COALESCE(?, name),
        model = COALESCE(?, model),
        manufacturer = COALESCE(?, manufacturer),
        boat_type_id = COALESCE(?, boat_type_id),
        year = COALESCE(?, year),
        length_meters = COALESCE(?, length_meters),
        width_meters = COALESCE(?, width_meters),
        draft_meters = COALESCE(?, draft_meters),
        home_marina = COALESCE(?, home_marina),
        registration_number = COALESCE(?, registration_number),
        insurance_provider = COALESCE(?, insurance_provider),
        insurance_policy_number = COALESCE(?, insurance_policy_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1`,
      [
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
        id,
      ]
    );

    // Fetch the updated boat
    const boats = await query(
      `SELECT 
        b.id,
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
      [id]
    );

    if (boats.length === 0) {
      return res.status(404).json({ error: "Boat not found" });
    }

    return res.status(200).json({
      success: true,
      data: boats[0],
      message: "Boat updated successfully",
    });
  } catch (error) {
    console.error("Error updating boat:", error);
    return res.status(500).json({ error: "Failed to update boat" });
  }
}

async function deleteBoat(req: VercelRequest, res: VercelResponse, id: string) {
  try {
    // Soft delete
    await query(
      `UPDATE boats SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Boat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting boat:", error);
    return res.status(500).json({ error: "Failed to delete boat" });
  }
}
