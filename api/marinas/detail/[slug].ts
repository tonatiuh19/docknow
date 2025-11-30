import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Marina slug is required" });
    }

    // Get marina details
    const marinaQuery = `
      SELECT 
        m.*,
        bt.name as business_type_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM marinas m
      LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
      LEFT JOIN reviews r ON m.id = r.marina_id AND r.is_approved = TRUE
      WHERE m.slug = ? AND m.is_active = TRUE
      GROUP BY m.id, bt.name
    `;

    const marinaResult = await query(marinaQuery, [slug]);

    if (!Array.isArray(marinaResult) || marinaResult.length === 0) {
      return res.status(404).json({ error: "Marina not found" });
    }

    const marina = marinaResult[0];

    // Get images
    const images = await query(
      `SELECT id, image_url as url, title, is_primary as isPrimary, display_order as displayOrder
       FROM marina_images
       WHERE marina_id = ?
       ORDER BY is_primary DESC, display_order ASC`,
      [marina.id]
    );

    // Get amenities
    const amenities = await query(
      `SELECT at.id, at.name, at.icon, at.category, at.description
       FROM marina_amenities ma
       JOIN amenity_types at ON ma.amenity_id = at.id
       WHERE ma.marina_id = ?
       ORDER BY at.category, at.name`,
      [marina.id]
    );

    // Get marina features
    const featuresResult = await query(
      `SELECT * FROM marina_features WHERE marina_id = ?`,
      [marina.id]
    );
    const features = featuresResult.length > 0 ? featuresResult[0] : {};

    // Get slips
    const slips = await query(
      `SELECT 
        id, slip_number, length_meters, width_meters, depth_meters,
        power_amp, water_available, is_available, price_per_day
       FROM slips
       WHERE marina_id = ?
       ORDER BY slip_number`,
      [marina.id]
    );

    // Get anchorages with types
    const anchorages = await query(
      `SELECT 
        a.id, a.name, a.latitude, a.longitude, a.depth_meters,
        a.protection_level, a.max_boat_length_meters, a.is_available,
        at.name as type_name, at.description as type_description
       FROM anchorages a
       JOIN anchorage_types at ON a.anchorage_type_id = at.id
       WHERE a.marina_id = ?
       ORDER BY a.name`,
      [marina.id]
    );

    // Get moorings with types
    const moorings = await query(
      `SELECT 
        m.id, m.mooring_number, m.max_boat_length_meters, m.max_displacement_kg,
        m.latitude, m.longitude, m.depth_meters, m.is_available, m.price_per_day,
        mt.name as type_name, mt.description as type_description
       FROM moorings m
       JOIN mooring_types mt ON m.mooring_type_id = mt.id
       WHERE m.marina_id = ?
       ORDER BY m.mooring_number`,
      [marina.id]
    );

    // Get seabeds with types
    const seabeds = await query(
      `SELECT 
        s.id, s.area_name, s.latitude, s.longitude, s.depth_meters,
        s.holding_quality, s.notes,
        st.name as type_name, st.description as type_description
       FROM seabeds s
       JOIN seabed_types st ON s.seabed_type_id = st.id
       WHERE s.marina_id = ?
       ORDER BY s.area_name`,
      [marina.id]
    );

    // Get points of interest with types
    const points = await query(
      `SELECT 
        p.id, p.name, p.description, p.latitude, p.longitude, p.distance_meters,
        pt.name as type_name, pt.icon as type_icon, pt.description as type_description
       FROM points p
       JOIN point_types pt ON p.point_type_id = pt.id
       WHERE p.marina_id = ? AND p.is_active = TRUE
       ORDER BY p.distance_meters, p.name`,
      [marina.id]
    );

    // Get ratings with categories
    const ratings = await query(
      `SELECT 
        r.id, r.rating_value, r.comment, r.created_at,
        rc.name as category_name, rc.description as category_description
       FROM ratings r
       JOIN rating_categories rc ON r.category_id = rc.id
       WHERE r.marina_id = ?
       ORDER BY rc.weight DESC, r.created_at DESC`,
      [marina.id]
    );

    // Calculate average ratings by category
    const categoryRatings: any = {};
    (ratings as any[]).forEach((rating: any) => {
      if (!categoryRatings[rating.category_name]) {
        categoryRatings[rating.category_name] = {
          name: rating.category_name,
          description: rating.category_description,
          ratings: [],
          average: 0,
        };
      }
      categoryRatings[rating.category_name].ratings.push({
        value: parseFloat(rating.rating_value),
        comment: rating.comment,
        date: rating.created_at,
      });
    });

    Object.keys(categoryRatings).forEach((key) => {
      const sum = categoryRatings[key].ratings.reduce(
        (acc: number, r: any) => acc + r.value,
        0
      );
      categoryRatings[key].average = (
        sum / categoryRatings[key].ratings.length
      ).toFixed(1);
    });

    // Get reviews
    const reviews = await query(
      `SELECT 
        r.id, r.rating, r.comment, r.created_at,
        u.name as user_name, u.email as user_email
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.marina_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [marina.id]
    );

    // Get active coupons
    const coupons = await query(
      `SELECT id, code, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, description
       FROM coupons
       WHERE marina_id = ?
         AND is_active = TRUE
         AND (valid_from IS NULL OR valid_from <= NOW())
         AND (valid_until IS NULL OR valid_until >= NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
      [marina.id]
    );

    // Format response
    const response = {
      id: marina.id,
      slug: marina.slug,
      name: marina.name,
      description: marina.description,
      businessType: marina.business_type_name,
      location: {
        address: marina.address,
        city: marina.city,
        state: marina.state,
        country: marina.country,
        postalCode: marina.postal_code,
        latitude: parseFloat(marina.latitude),
        longitude: parseFloat(marina.longitude),
      },
      contact: {
        phone: marina.phone,
        email: marina.email,
        website: marina.website,
      },
      capacity: {
        totalSlips: marina.total_slips,
        availableSlips: marina.available_slips,
        maxBoatLength: parseFloat(marina.max_boat_length_meters),
        maxBoatDraft: parseFloat(marina.max_boat_draft_meters),
      },
      pricing: {
        pricePerDay: parseFloat(marina.price_per_day),
        currency: "MXN",
      },
      rating: {
        average: parseFloat(marina.avg_rating).toFixed(1),
        count: parseInt(marina.review_count),
        byCategory: Object.values(categoryRatings),
      },
      isFeatured: Boolean(marina.is_featured),
      images: (images as any[]).map((img: any) => ({
        id: img.id,
        url: img.url,
        title: img.title,
        isPrimary: Boolean(img.isPrimary),
        displayOrder: img.displayOrder,
      })),
      amenities: (amenities as any[]).map((a: any) => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        category: a.category,
        description: a.description,
      })),
      features: {
        hasFuelDock: Boolean(features.has_fuel_dock),
        hasPumpOut: Boolean(features.has_pump_out),
        hasHaulOut: Boolean(features.has_haul_out),
        hasBoatRamp: Boolean(features.has_boat_ramp),
        hasDryStorage: Boolean(features.has_dry_storage),
        acceptsLiveAboard: Boolean(features.has_live_aboard),
        acceptsMegayachts: Boolean(features.accepts_megayachts),
        maxHaulOutTons: features.max_haul_out_tons
          ? parseFloat(features.max_haul_out_tons)
          : null,
      },
      slips: (slips as any[]).map((s: any) => ({
        id: s.id,
        slipNumber: s.slip_number,
        length: parseFloat(s.length_meters),
        width: parseFloat(s.width_meters),
        depth: parseFloat(s.depth_meters),
        powerAmp: s.power_amp,
        waterAvailable: Boolean(s.water_available),
        isAvailable: Boolean(s.is_available),
        pricePerDay: parseFloat(s.price_per_day),
      })),
      anchorages: (anchorages as any[]).map((a: any) => ({
        id: a.id,
        name: a.name,
        type: {
          name: a.type_name,
          description: a.type_description,
        },
        latitude: parseFloat(a.latitude),
        longitude: parseFloat(a.longitude),
        depth: parseFloat(a.depth_meters),
        protectionLevel: a.protection_level,
        maxBoatLength: parseFloat(a.max_boat_length_meters),
        isAvailable: Boolean(a.is_available),
      })),
      moorings: (moorings as any[]).map((m: any) => ({
        id: m.id,
        mooringNumber: m.mooring_number,
        type: {
          name: m.type_name,
          description: m.type_description,
        },
        maxBoatLength: parseFloat(m.max_boat_length_meters),
        maxDisplacement: parseFloat(m.max_displacement_kg),
        latitude: parseFloat(m.latitude),
        longitude: parseFloat(m.longitude),
        depth: parseFloat(m.depth_meters),
        isAvailable: Boolean(m.is_available),
        pricePerDay: parseFloat(m.price_per_day),
      })),
      seabeds: (seabeds as any[]).map((s: any) => ({
        id: s.id,
        areaName: s.area_name,
        type: {
          name: s.type_name,
          description: s.type_description,
        },
        latitude: parseFloat(s.latitude),
        longitude: parseFloat(s.longitude),
        depth: parseFloat(s.depth_meters),
        holdingQuality: s.holding_quality,
        notes: s.notes,
      })),
      pointsOfInterest: (points as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        type: {
          name: p.type_name,
          icon: p.type_icon,
          description: p.type_description,
        },
        latitude: parseFloat(p.latitude),
        longitude: parseFloat(p.longitude),
        distance: parseFloat(p.distance_meters),
      })),
      reviews: (reviews as any[]).map((r: any) => ({
        id: r.id,
        rating: parseFloat(r.rating),
        comment: r.comment,
        date: r.created_at,
        user: {
          name: r.user_name,
          email: r.user_email,
        },
      })),
      coupons: (coupons as any[]).map((c: any) => ({
        id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: parseFloat(c.discount_value),
        description: c.description,
        maxUses: c.max_uses,
        usedCount: c.used_count,
        validFrom: c.valid_from,
        validUntil: c.valid_until,
      })),
    };

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Marina detail error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch marina details",
    });
  }
}
