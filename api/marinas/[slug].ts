import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../../src/lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Marina slug is required" });
    }

    // Get marina details with all related data
    const marinaQuery = `
      SELECT 
        m.id,
        m.slug,
        m.name,
        m.description,
        m.price_per_day,
        m.city,
        m.state,
        m.country,
        m.address,
        m.postal_code,
        m.latitude,
        m.longitude,
        m.contact_name,
        m.contact_email,
        m.contact_phone,
        m.website_url,
        m.total_slips,
        m.available_slips,
        m.max_boat_length_meters,
        m.max_boat_draft_meters,
        m.is_featured,
        m.created_at,
        bt.name as business_type,
        bt.description as business_type_description,
        u.full_name as owner_name,
        u.email as owner_email,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM marinas m
      LEFT JOIN marina_business_types bt ON m.business_type_id = bt.id
      LEFT JOIN users u ON m.owner_id = u.id
      LEFT JOIN reviews r ON m.id = r.marina_id AND r.is_approved = TRUE
      WHERE m.slug = ? AND m.is_active = TRUE
      GROUP BY m.id, bt.name, bt.description, u.full_name, u.email
    `;

    const marinaResult = await query(marinaQuery, [slug]);

    if ((marinaResult as any[]).length === 0) {
      return res.status(404).json({ error: "Marina not found" });
    }

    const marina = (marinaResult as any[])[0];

    // Get images
    const imagesQuery = `
      SELECT id, image_url, title, display_order, is_primary
      FROM marina_images
      WHERE marina_id = ?
      ORDER BY is_primary DESC, display_order ASC
    `;
    const imagesResult = await query(imagesQuery, [marina.id]);

    // Get amenities
    const amenitiesQuery = `
      SELECT 
        at.id,
        at.name,
        at.slug,
        at.icon,
        at.category
      FROM marina_amenities ma
      JOIN amenity_types at ON ma.amenity_id = at.id
      WHERE ma.marina_id = ?
      ORDER BY at.category, at.name
    `;
    const amenitiesResult = await query(amenitiesQuery, [marina.id]);

    // Get reviews
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name as user_name,
        u.profile_image_url as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.marina_id = ? AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const reviewsResult = await query(reviewsQuery, [marina.id]);

    // Get blocked dates for the next 6 months
    const blockedDatesQuery = `
      SELECT blocked_date, reason
      FROM blocked_dates
      WHERE marina_id = ? 
        AND blocked_date >= CURRENT_DATE 
        AND blocked_date <= DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH)
      ORDER BY blocked_date
    `;
    const blockedDatesResult = await query(blockedDatesQuery, [marina.id]);

    // Get booked dates for the next 6 months
    const bookedDatesQuery = `
      SELECT check_in_date, check_out_date
      FROM bookings
      WHERE marina_id = ? 
        AND status IN ('pending', 'confirmed')
        AND check_out_date >= CURRENT_DATE
        AND check_in_date <= DATE_ADD(CURRENT_DATE, INTERVAL 6 MONTH)
      ORDER BY check_in_date
    `;
    const bookedDatesResult = await query(bookedDatesQuery, [marina.id]);

    // Get active coupons for this marina
    const couponsQuery = `
      SELECT code, description, discount_type, discount_value, min_days
      FROM coupons
      WHERE (marina_id = ? OR marina_id IS NULL)
        AND is_active = TRUE
        AND valid_from <= CURRENT_TIMESTAMP
        AND valid_until >= CURRENT_TIMESTAMP
        AND (max_uses IS NULL OR times_used < max_uses)
    `;
    const couponsResult = await query(couponsQuery, [marina.id]);

    // Format the response
    const marinaDetails = {
      id: marina.id,
      slug: marina.slug,
      name: marina.name,
      description: marina.description,
      pricePerDay: parseFloat(marina.price_per_day),
      location: {
        city: marina.city,
        state: marina.state,
        country: marina.country,
        address: marina.address,
        postalCode: marina.postal_code,
        coordinates: {
          latitude: parseFloat(marina.latitude),
          longitude: parseFloat(marina.longitude),
        },
      },
      contact: {
        name: marina.contact_name,
        email: marina.contact_email,
        phone: marina.contact_phone,
        website: marina.website_url,
      },
      capacity: {
        totalSlips: marina.total_slips,
        availableSlips: marina.available_slips,
        maxBoatLength: parseFloat(marina.max_boat_length_meters),
        maxBoatDraft: parseFloat(marina.max_boat_draft_meters),
      },
      businessType: {
        name: marina.business_type,
        description: marina.business_type_description,
      },
      owner: {
        name: marina.owner_name,
        email: marina.owner_email,
      },
      isFeatured: Boolean(marina.is_featured),
      rating: {
        average: parseFloat(marina.avg_rating).toFixed(1),
        count: parseInt(marina.review_count),
      },
      images: (imagesResult as any[]).map((img: any) => ({
        id: img.id,
        url: img.image_url,
        title: img.title,
        isPrimary: Boolean(img.is_primary),
        displayOrder: img.display_order,
      })),
      amenities: (amenitiesResult as any[]).map((amenity: any) => ({
        id: amenity.id,
        name: amenity.name,
        slug: amenity.slug,
        icon: amenity.icon,
        category: amenity.category,
      })),
      reviews: (reviewsResult as any[]).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        user: {
          name: review.user_name,
          avatar: review.user_avatar,
        },
      })),
      availability: {
        blockedDates: (blockedDatesResult as any[]).map((bd: any) => ({
          date: bd.blocked_date,
          reason: bd.reason,
        })),
        bookedDates: (bookedDatesResult as any[]).map((bd: any) => ({
          checkIn: bd.check_in_date,
          checkOut: bd.check_out_date,
        })),
      },
      coupons: (couponsResult as any[]).map((coupon: any) => ({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: parseFloat(coupon.discount_value),
        minDays: coupon.min_days,
      })),
      createdAt: marina.created_at,
    };

    return res.status(200).json({
      success: true,
      data: marinaDetails,
    });
  } catch (error) {
    console.error("Marina details error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch marina details",
    });
  }
}
