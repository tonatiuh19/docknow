import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for iOS app
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
    // Get amenity types
    const amenityTypes = await query(`
      SELECT id, name, icon, category, slug
      FROM amenity_types
      WHERE is_active = TRUE
      ORDER BY category, name
    `);

    // Get business types
    const businessTypes = await query(`
      SELECT id, name, slug, description
      FROM marina_business_types
      WHERE is_active = TRUE
      ORDER BY name
    `);

    // Get anchorage types
    const anchorageTypes = await query(`
      SELECT id, name, slug, description
      FROM anchorage_types
      WHERE is_active = TRUE
      ORDER BY name
    `);

    // Get mooring types
    const mooringTypes = await query(`
      SELECT id, name, slug, description
      FROM mooring_types
      WHERE is_active = TRUE
      ORDER BY name
    `);

    // Get seabed types
    const seabedTypes = await query(`
      SELECT id, name, slug, description
      FROM seabed_types
      WHERE is_active = TRUE
      ORDER BY name
    `);

    // Get point types (for map POIs)
    const pointTypes = await query(`
      SELECT id, name, icon, slug
      FROM point_types
      WHERE is_active = TRUE
      ORDER BY name
    `);

    // Get rating categories
    const ratingCategories = await query(`
      SELECT id, name, description, weight
      FROM rating_categories
      WHERE is_active = TRUE
      ORDER BY weight DESC, name
    `);

    // Get unique cities and states
    const locations = await query(`
      SELECT DISTINCT city, state, country
      FROM marinas
      WHERE is_active = TRUE
      ORDER BY country, state, city
    `);

    // Get price range
    const priceRange = await query(`
      SELECT 
        MIN(price_per_day) as min_price,
        MAX(price_per_day) as max_price
      FROM marinas
      WHERE is_active = TRUE
    `);

    return res.status(200).json({
      success: true,
      data: {
        amenityTypes: (amenityTypes as any[]).map((a) => ({
          id: a.id,
          name: a.name,
          icon: a.icon,
          category: a.category,
          description: a.description,
        })),
        businessTypes: (businessTypes as any[]).map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          description: b.description,
        })),
        anchorageTypes: (anchorageTypes as any[]).map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
        })),
        mooringTypes: (mooringTypes as any[]).map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
        })),
        seabedTypes: (seabedTypes as any[]).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
        })),
        pointTypes: (pointTypes as any[]).map((p) => ({
          id: p.id,
          name: p.name,
          icon: p.icon,
          description: p.description,
        })),
        ratingCategories: (ratingCategories as any[]).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          weight: parseFloat(r.weight),
        })),
        locations: (locations as any[]).map((l) => ({
          city: l.city,
          state: l.state,
          country: l.country,
          label: `${l.city}, ${l.state}, ${l.country}`,
        })),
        priceRange: {
          min: parseFloat((priceRange as any)[0].min_price),
          max: parseFloat((priceRange as any)[0].max_price),
        },
      },
    });
  } catch (error) {
    console.error("Filters fetch error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch filter options",
    });
  }
}
