// API Response Types - These match exactly what the backend returns

export interface ApiMarinaImage {
  marina_id: number;
  id: number;
  url: string;
  title: string;
  isPrimary: number;
}

export interface ApiMarinaAmenity {
  marina_id: number;
  id: number;
  name: string;
  icon: string;
  category: "utility" | "service" | "facility";
}

export interface ApiMarinaLocation {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface ApiMarinaCapacity {
  totalSlips: number;
  availableSlips: number;
  maxBoatLength: number;
  maxBoatDraft: number;
}

export interface ApiMarinaResponse {
  id: number;
  slug: string;
  name: string;
  description: string;
  pricePerDay: number;
  location: ApiMarinaLocation;
  capacity: ApiMarinaCapacity;
  businessType: string;
  isFeatured: number;
  rating: string;
  reviewCount: number;
  images: ApiMarinaImage[];
  amenities: ApiMarinaAmenity[];
  // Optional fields for backward compatibility
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiMarinasSearchResponse {
  success: boolean;
  data: {
    marinas: ApiMarinaResponse[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

// Transform function to convert API response to internal Marina type
export function transformApiMarina(apiMarina: ApiMarinaResponse): Marina {
  return {
    id: apiMarina.id,
    name: apiMarina.name,
    slug: apiMarina.slug,
    description: apiMarina.description || "",
    location: `${apiMarina.location.city}, ${apiMarina.location.state}`,
    coordinates: {
      lat: apiMarina.location.latitude,
      lng: apiMarina.location.longitude,
    },
    contact_email: apiMarina.contact_email || "",
    contact_phone: apiMarina.contact_phone || "",
    image_url: apiMarina.images?.[0]?.url || "",
    price_per_day: apiMarina.pricePerDay || 0,
    is_active: apiMarina.is_active !== false,
    is_featured: apiMarina.isFeatured === 1,
    created_at: apiMarina.created_at || new Date().toISOString(),
    updated_at: apiMarina.updated_at || new Date().toISOString(),
  };
}

// Internal Application Types - These are used throughout the app

export interface Marina {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contact_email?: string;
  contact_phone?: string;
  image_url?: string;
  price_per_day?: number;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarinaFilters {
  search: string;
  city: string;
  state: string;
  checkIn: string;
  checkOut: string;
  minPrice: string;
  maxPrice: string;
  minBoatLength: string;
  maxBoatLength: string;
  minDraft: string;
  featured: boolean;
  amenityIds: number[];
  businessTypeId: string;
}

export interface MarinaFilterOptions {
  cities: string[];
  states: string[];
  amenities: Array<{ id: number; name: string; icon: string }>;
  businessTypes: Array<{ id: number; name: string }>;
  priceRange: { min: number; max: number };
}

export interface MarinaPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
