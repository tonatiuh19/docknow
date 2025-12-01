import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

interface SearchFilters {
  city?: string;
  state?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: number[];
  businessTypeId?: number;
  minBoatLength?: number;
  maxBoatLength?: number;
  minDraft?: number;
  searchTerm?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      businessTypeId,
      minBoatLength,
      maxBoatLength,
      minDraft,
      searchTerm,
      featured,
      limit = 20,
      offset = 0,
    } = req.query as any;

    // Build the WHERE clause dynamically
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

    // Business type filter
    if (businessTypeId) {
      conditions.push("m.business_type_id = ?");
      params.push(parseInt(businessTypeId.toString()));
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

    // Search term (name, description, city)
    if (searchTerm) {
      conditions.push(
        "(LOWER(m.name) LIKE ? OR LOWER(m.description) LIKE ? OR LOWER(m.city) LIKE ?)"
      );
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Base query with slip-level availability check
    let availabilityJoin = "";
    if (checkIn && checkOut) {
      // Updated to check slip-level availability
      // A marina is available if it has at least one slip that is:
      // 1. Not fully booked for the date range
      // 2. Not blocked for the entire date range (marina-wide or all slips blocked)
      availabilityJoin = `
        INNER JOIN (
          SELECT DISTINCT m.id as marina_id
          FROM marinas m
          WHERE EXISTS (
            SELECT 1
            FROM slips s
            WHERE s.marina_id = m.id
              AND s.is_available = 1
              -- Slip not booked during requested dates
              AND NOT EXISTS (
                SELECT 1
                FROM bookings b
                WHERE b.slip_id = s.id
                  AND b.status IN ('pending', 'confirmed')
                  AND (
                    (b.check_in_date <= ? AND b.check_out_date >= ?)
                    OR (b.check_in_date <= ? AND b.check_out_date >= ?)
                    OR (b.check_in_date >= ? AND b.check_out_date <= ?)
                  )
              )
              -- Slip not blocked during requested dates
              AND NOT EXISTS (
                SELECT 1
                FROM blocked_dates bd
                WHERE (bd.slip_id = s.id OR bd.slip_id IS NULL)
                  AND bd.marina_id = m.id
                  AND bd.blocked_date BETWEEN ? AND ?
              )
          )
        ) AS available_marinas ON m.id = available_marinas.marina_id
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
    }

    // Amenities filter
    let amenityJoin = "";
    if (amenities) {
      // Handle both array and comma-separated string
      const amenityArray = Array.isArray(amenities)
        ? amenities
        : typeof amenities === "string"
        ? amenities.split(",")
        : [amenities];
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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Main query
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
        COUNT(DISTINCT r.id) as review_count
      FROM marinas m
      LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
      LEFT JOIN reviews r ON m.id = r.marina_id AND r.is_approved = TRUE
      ${availabilityJoin}
      ${amenityJoin}
      ${whereClause}
      GROUP BY m.id, m.slug, m.name, m.description, m.price_per_day, m.city, m.state, 
               m.country, m.latitude, m.longitude, m.total_slips, m.available_slips,
               m.max_boat_length_meters, m.max_boat_draft_meters, m.is_featured, bt.name
      ORDER BY m.is_featured DESC, avg_rating DESC, m.price_per_day ASC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit.toString()), parseInt(offset.toString()));

    // Get count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM marinas m
      ${availabilityJoin}
      ${amenityJoin}
      ${whereClause}
    `;

    // Execute queries
    const marinasResult = await query(searchQuery, params);
    const countParams = params.slice(0, -2); // Remove limit and offset for count
    const countResult = await query(countQuery, countParams);

    // Get images and amenities for each marina
    const marinaIds = (marinasResult as any[]).map((m: any) => m.id);

    let marinaImages: any = {};
    let marinaAmenities: any = {};

    if (marinaIds.length > 0) {
      const imagesPlaceholders = marinaIds.map(() => "?").join(",");
      const imagesQuery = `
        SELECT marina_id, id, image_url as url, title, is_primary as isPrimary
        FROM marina_images
        WHERE marina_id IN (${imagesPlaceholders})
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
        WHERE ma.marina_id IN (${imagesPlaceholders})
      `;
      const amenitiesData = await query(amenitiesQuery, marinaIds);

      (amenitiesData as any[]).forEach((amenity: any) => {
        if (!marinaAmenities[amenity.marina_id])
          marinaAmenities[amenity.marina_id] = [];
        marinaAmenities[amenity.marina_id].push(amenity);
      });
    }

    const marinas = (marinasResult as any[]).map((marina: any) => ({
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
        availableSlips: marina.available_slips,
        maxBoatLength: parseFloat(marina.max_boat_length_meters),
        maxBoatDraft: parseFloat(marina.max_boat_draft_meters),
      },
      businessType: marina.business_type,
      isFeatured: marina.is_featured,
      rating: parseFloat(marina.avg_rating).toFixed(1),
      reviewCount: parseInt(marina.review_count),
      images: marinaImages[marina.id] || [],
      amenities: marinaAmenities[marina.id] || [],
    }));

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
