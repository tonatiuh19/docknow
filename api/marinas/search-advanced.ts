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
    const {
      city,
      state,
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      amenities,
      minBoatLength,
      maxBoatLength,
      minDraft,
      searchTerm,
      featured,
      // New advanced filters
      hasSlips,
      hasAnchorage,
      hasMoorings,
      anchorageTypes,
      mooringTypes,
      seabedTypes,
      minRating,
      hasFuelDock,
      hasPumpOut,
      hasHaulOut,
      hasBoatRamp,
      hasDryStorage,
      acceptsLiveAboard,
      acceptsMegayachts,
      limit = 20,
      offset = 0,
    } = req.query as any;

    const conditions: string[] = ["m.is_active = TRUE"];
    const params: any[] = [];

    // Location filters
    if (city) {
      conditions.push("m.city = ?");
      params.push(city);
    }

    if (state) {
      conditions.push("m.state = ?");
      params.push(state);
    }

    // Price filters
    if (minPrice) {
      conditions.push("m.price_per_day >= ?");
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push("m.price_per_day <= ?");
      params.push(parseFloat(maxPrice));
    }

    // Boat size filters
    if (minBoatLength) {
      conditions.push("m.max_boat_length_meters >= ?");
      params.push(parseFloat(minBoatLength));
    }

    if (maxBoatLength) {
      conditions.push("m.max_boat_length_meters >= ?");
      params.push(parseFloat(maxBoatLength));
    }

    if (minDraft) {
      conditions.push("m.max_boat_draft_meters >= ?");
      params.push(parseFloat(minDraft));
    }

    // Featured filter
    if (featured === "true") {
      conditions.push("m.is_featured = TRUE");
    }

    // Search term
    if (searchTerm) {
      conditions.push(
        "(LOWER(m.name) LIKE ? OR LOWER(m.description) LIKE ? OR LOWER(m.city) LIKE ?)"
      );
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Rating filter
    if (minRating) {
      conditions.push(
        "(SELECT AVG(rating) FROM reviews WHERE marina_id = m.id AND is_approved = TRUE) >= ?"
      );
      params.push(parseFloat(minRating));
    }

    // Availability check
    let availabilityJoin = "";
    if (checkIn && checkOut) {
      availabilityJoin = `
        LEFT JOIN (
          SELECT marina_id
          FROM bookings
          WHERE status IN ('pending', 'confirmed')
            AND (
              (check_in_date <= ? AND check_out_date >= ?)
              OR (check_in_date <= ? AND check_out_date >= ?)
              OR (check_in_date >= ? AND check_out_date <= ?)
            )
          UNION
          SELECT marina_id
          FROM blocked_dates
          WHERE blocked_date BETWEEN ? AND ?
        ) AS unavailable ON m.id = unavailable.marina_id
      `;
      params.push(
        checkIn,
        checkIn,
        checkOut,
        checkOut,
        checkIn,
        checkOut,
        checkIn,
        checkOut
      );
      conditions.push("unavailable.marina_id IS NULL");
    }

    // Amenities filter
    let amenityJoin = "";
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      const amenityIds = amenityArray
        .map((a) => parseInt(a.toString()))
        .filter((id) => !isNaN(id));
      if (amenityIds.length > 0) {
        const placeholders = amenityIds.map(() => "?").join(",");
        amenityJoin = `
          INNER JOIN (
            SELECT marina_id
            FROM marina_amenities
            WHERE amenity_id IN (${placeholders})
            GROUP BY marina_id
            HAVING COUNT(DISTINCT amenity_id) = ?
          ) AS filtered_amenities ON m.id = filtered_amenities.marina_id
        `;
        params.push(...amenityIds, amenityIds.length);
      }
    }

    // Advanced feature filters
    let featuresJoin = "";
    const featureConditions: string[] = [];

    if (hasFuelDock === "true")
      featureConditions.push("mf.has_fuel_dock = TRUE");
    if (hasPumpOut === "true") featureConditions.push("mf.has_pump_out = TRUE");
    if (hasHaulOut === "true") featureConditions.push("mf.has_haul_out = TRUE");
    if (hasBoatRamp === "true")
      featureConditions.push("mf.has_boat_ramp = TRUE");
    if (hasDryStorage === "true")
      featureConditions.push("mf.has_dry_storage = TRUE");
    if (acceptsLiveAboard === "true")
      featureConditions.push("mf.has_live_aboard = TRUE");
    if (acceptsMegayachts === "true")
      featureConditions.push("mf.accepts_megayachts = TRUE");

    if (featureConditions.length > 0) {
      featuresJoin = "LEFT JOIN marina_features mf ON m.id = mf.marina_id";
      conditions.push(`(${featureConditions.join(" AND ")})`);
    }

    // Slip availability filter
    if (hasSlips === "true") {
      conditions.push(
        "EXISTS (SELECT 1 FROM slips WHERE marina_id = m.id AND is_available = TRUE)"
      );
    }

    // Anchorage filter
    let anchorageJoin = "";
    if (hasAnchorage === "true" || anchorageTypes) {
      if (anchorageTypes) {
        const anchorageArray = Array.isArray(anchorageTypes)
          ? anchorageTypes
          : [anchorageTypes];
        const anchorageIds = anchorageArray
          .map((a) => parseInt(a.toString()))
          .filter((id) => !isNaN(id));
        if (anchorageIds.length > 0) {
          const placeholders = anchorageIds.map(() => "?").join(",");
          anchorageJoin = `
            INNER JOIN (
              SELECT DISTINCT marina_id
              FROM anchorages
              WHERE is_available = TRUE AND anchorage_type_id IN (${placeholders})
            ) AS filtered_anchorages ON m.id = filtered_anchorages.marina_id
          `;
          params.push(...anchorageIds);
        }
      } else {
        conditions.push(
          "EXISTS (SELECT 1 FROM anchorages WHERE marina_id = m.id AND is_available = TRUE)"
        );
      }
    }

    // Mooring filter
    let mooringJoin = "";
    if (hasMoorings === "true" || mooringTypes) {
      if (mooringTypes) {
        const mooringArray = Array.isArray(mooringTypes)
          ? mooringTypes
          : [mooringTypes];
        const mooringIds = mooringArray
          .map((m) => parseInt(m.toString()))
          .filter((id) => !isNaN(id));
        if (mooringIds.length > 0) {
          const placeholders = mooringIds.map(() => "?").join(",");
          mooringJoin = `
            INNER JOIN (
              SELECT DISTINCT marina_id
              FROM moorings
              WHERE is_available = TRUE AND mooring_type_id IN (${placeholders})
            ) AS filtered_moorings ON m.id = filtered_moorings.marina_id
          `;
          params.push(...mooringIds);
        }
      } else {
        conditions.push(
          "EXISTS (SELECT 1 FROM moorings WHERE marina_id = m.id AND is_available = TRUE)"
        );
      }
    }

    // Seabed type filter
    if (seabedTypes) {
      const seabedArray = Array.isArray(seabedTypes)
        ? seabedTypes
        : [seabedTypes];
      const seabedIds = seabedArray
        .map((s) => parseInt(s.toString()))
        .filter((id) => !isNaN(id));
      if (seabedIds.length > 0) {
        const placeholders = seabedIds.map(() => "?").join(",");
        conditions.push(
          `EXISTS (SELECT 1 FROM seabeds WHERE marina_id = m.id AND seabed_type_id IN (${placeholders}))`
        );
        params.push(...seabedIds);
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Main query with extended data
    const searchQuery = `
      SELECT 
        m.id,
        m.slug,
        m.name,
        m.description,
        m.price_per_day,
        m.city,
        m.state,
        m.country,
        m.latitude,
        m.longitude,
        m.total_slips,
        m.available_slips,
        m.max_boat_length_meters,
        m.max_boat_draft_meters,
        m.is_featured,
        bt.name as business_type,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT s.id) as available_slips_count,
        COUNT(DISTINCT a.id) as anchorage_count,
        COUNT(DISTINCT mo.id) as mooring_count,
        COUNT(DISTINCT p.id) as poi_count
      FROM marinas m
      LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
      LEFT JOIN reviews r ON m.id = r.marina_id AND r.is_approved = TRUE
      LEFT JOIN slips s ON m.id = s.marina_id AND s.is_available = TRUE
      LEFT JOIN anchorages a ON m.id = a.marina_id AND a.is_available = TRUE
      LEFT JOIN moorings mo ON m.id = mo.marina_id AND mo.is_available = TRUE
      LEFT JOIN points p ON m.id = p.marina_id AND p.is_active = TRUE
      ${availabilityJoin}
      ${amenityJoin}
      ${anchorageJoin}
      ${mooringJoin}
      ${featuresJoin}
      ${whereClause}
      GROUP BY m.id, m.slug, m.name, m.description, m.price_per_day, m.city, m.state, 
               m.country, m.latitude, m.longitude, m.total_slips, m.available_slips,
               m.max_boat_length_meters, m.max_boat_draft_meters, m.is_featured, bt.name
      ORDER BY m.is_featured DESC, avg_rating DESC, m.price_per_day ASC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit.toString()), parseInt(offset.toString()));

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM marinas m
      ${availabilityJoin}
      ${amenityJoin}
      ${anchorageJoin}
      ${mooringJoin}
      ${featuresJoin}
      ${whereClause}
    `;

    const marinasResult = await query(searchQuery, params);
    const countParams = params.slice(0, -2);
    const countResult = await query(countQuery, countParams);

    // Get images and amenities
    const marinaIds = (marinasResult as any[]).map((m: any) => m.id);

    let marinaImages: any = {};
    let marinaAmenities: any = {};
    let marinaFeatures: any = {};

    if (marinaIds.length > 0) {
      const placeholders = marinaIds.map(() => "?").join(",");

      const imagesQuery = `
        SELECT marina_id, id, image_url as url, title, is_primary as isPrimary
        FROM marina_images
        WHERE marina_id IN (${placeholders})
        ORDER BY is_primary DESC, display_order ASC
      `;
      const images = await query(imagesQuery, marinaIds);

      (images as any[]).forEach((img: any) => {
        if (!marinaImages[img.marina_id]) marinaImages[img.marina_id] = [];
        marinaImages[img.marina_id].push(img);
      });

      const amenitiesQuery = `
        SELECT ma.marina_id, at.id, at.name, at.icon, at.category
        FROM marina_amenities ma
        JOIN amenity_types at ON ma.amenity_id = at.id
        WHERE ma.marina_id IN (${placeholders})
      `;
      const amenitiesData = await query(amenitiesQuery, marinaIds);

      (amenitiesData as any[]).forEach((amenity: any) => {
        if (!marinaAmenities[amenity.marina_id])
          marinaAmenities[amenity.marina_id] = [];
        marinaAmenities[amenity.marina_id].push(amenity);
      });

      const featuresQuery = `
        SELECT * FROM marina_features WHERE marina_id IN (${placeholders})
      `;
      const featuresData = await query(featuresQuery, marinaIds);
      (featuresData as any[]).forEach((feature: any) => {
        marinaFeatures[feature.marina_id] = feature;
      });
    }

    const marinas = (marinasResult as any[]).map((marina: any) => {
      const features = marinaFeatures[marina.id] || {};
      return {
        id: marina.id,
        slug: marina.slug,
        name: marina.name,
        description: marina.description,
        pricePerDay: parseFloat(marina.price_per_day),
        location: {
          city: marina.city,
          state: marina.state,
          country: marina.country,
          latitude: parseFloat(marina.latitude),
          longitude: parseFloat(marina.longitude),
        },
        capacity: {
          totalSlips: marina.total_slips,
          availableSlips: marina.available_slips_count || 0,
          maxBoatLength: parseFloat(marina.max_boat_length_meters),
          maxBoatDraft: parseFloat(marina.max_boat_draft_meters),
        },
        businessType: marina.business_type,
        isFeatured: Boolean(marina.is_featured),
        rating: parseFloat(marina.avg_rating).toFixed(1),
        reviewCount: parseInt(marina.review_count),
        images: marinaImages[marina.id] || [],
        amenities: marinaAmenities[marina.id] || [],
        stats: {
          anchorages: parseInt(marina.anchorage_count) || 0,
          moorings: parseInt(marina.mooring_count) || 0,
          pointsOfInterest: parseInt(marina.poi_count) || 0,
        },
        features: {
          hasFuelDock: Boolean(features.has_fuel_dock),
          hasPumpOut: Boolean(features.has_pump_out),
          hasHaulOut: Boolean(features.has_haul_out),
          hasBoatRamp: Boolean(features.has_boat_ramp),
          hasDryStorage: Boolean(features.has_dry_storage),
          acceptsLiveAboard: Boolean(features.has_live_aboard),
          acceptsMegayachts: Boolean(features.accepts_megayachts),
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        marinas,
        pagination: {
          total: parseInt((countResult as any)[0].total),
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString()),
          hasMore:
            parseInt(offset.toString()) + marinas.length <
            parseInt((countResult as any)[0].total),
        },
      },
    });
  } catch (error) {
    console.error("Marina search error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to search marinas",
    });
  }
}
