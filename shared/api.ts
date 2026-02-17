/**
 * Shared API types for frontend and backend
 * Updated to match database schema and API responses
 */

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination interface
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Marina related types
export interface Marina {
  id: number;
  host_id?: number;
  name: string;
  slug: string;
  description: string;
  business_type_id?: number;
  price_per_day: number;
  city: string;
  state?: string;
  country: string;
  address?: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  total_slips: number;
  available_slips: number;
  max_boat_length_meters?: number;
  max_boat_draft_meters?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;

  // Additional fields from API joins
  business_type_name?: string;
  amenities?: string; // comma-separated amenity names
  avg_rating?: number;
  review_count?: number;
  primary_image_url?: string; // Primary marina image URL
  total_images?: number; // Total number of images for the marina
}

// Marina search request parameters
export interface MarinaSearchParams {
  city?: string;
  state?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  businessTypeId?: number;
  minBoatLength?: number;
  maxBoatLength?: number;
  minDraft?: number;
  searchTerm?: string;
  featured?: boolean;
  // New filter parameters
  seabedTypes?: number[];
  mooringTypes?: number[];
  pointTypes?: number[];
  anchorageTypes?: number[];
  protectionLevel?: string; // 'excellent' | 'good' | 'moderate'
  marinaFeatures?: string[]; // Array of feature keys like 'has_fuel_dock', 'has_pump_out', etc.
  limit?: number;
  offset?: number;
}

// Marina search response
export interface MarinaSearchResponse {
  marinas: Marina[];
  pagination: Pagination;
}

// Amenity type
export interface AmenityType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  category: "utility" | "facility" | "service";
  is_active: boolean;
}

// Business type
export interface BusinessType {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

// Seabed type for anchorage filtering
export interface SeabedType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

// Mooring type for marina filtering
export interface MooringType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

// Point of interest type
export interface PointType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
}

// Anchorage type
export interface AnchorageType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

// Marina feature options
export interface MarinaFeature {
  key: string;
  name: string;
  description?: string;
}

// Location option
export interface LocationOption {
  city: string;
  state: string;
  country: string;
  label: string;
}

// Price range
export interface PriceRange {
  min: number;
  max: number;
}

// Marina filters response
export interface MarinaFiltersResponse {
  amenityTypes: AmenityType[];
  businessTypes: BusinessType[];
  locations: LocationOption[];
  priceRange: PriceRange;
  // New filter options
  seabedTypes: SeabedType[];
  mooringTypes: MooringType[];
  pointTypes: PointType[];
  anchorageTypes: AnchorageType[];
  protectionLevels: Array<{ value: string; label: string }>;
  marinaFeatures: MarinaFeature[];
}

// Slip information
export interface Slip {
  id: number;
  marina_id: number;
  slip_number: string;
  length_meters?: number;
  width_meters?: number;
  max_boat_length_meters?: number;
  max_boat_draft_meters?: number;
  has_electricity: boolean;
  has_water: boolean;
  price_per_day: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Marina image information
export interface MarinaImage {
  id: number;
  marina_id: number;
  image_url: string;
  title?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

// Availability response
export interface AvailabilityResponse {
  bookedDates: Array<{ checkIn: string; checkOut: string }>;
  blockedDates: Array<{
    date: string;
    reason: string;
    slipId?: number;
    slipNumber?: string;
    startTime?: string | null;
    endTime?: string | null;
    isAllDay?: number;
  }>;
  availableSlips: Array<{
    id: number;
    slipNumber: string;
    length: number;
    width: number;
    depth: number;
    pricePerDay: number;
  }>;
}

// Auth related types
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  sessionToken: string;
}

// Payment related types
export interface PaymentIntentRequest {
  userId: number;
  marinaId: number;
  boatId: number;
  slipId: number;
  checkIn: string;
  checkOut: string;
  couponCode?: string;
  specialRequests?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  bookingId: number;
  totalAmount: number;
}

export interface ConfirmBookingRequest {
  bookingId: number;
  paymentIntentId: string;
}

export interface BookingConfirmationResponse {
  success: boolean;
  booking: {
    id: number;
    status: string;
    total_amount: number;
  };
}

// API endpoint types
export type HealthResponse = ApiResponse<{ status: string; timestamp: string }>;
export type MarinaSearchApiResponse = ApiResponse<MarinaSearchResponse>;
export type MarinaFiltersApiResponse = ApiResponse<MarinaFiltersResponse>;
export type MarinaDetailsApiResponse = ApiResponse<any>;
export type MarinaAvailabilityApiResponse = ApiResponse<AvailabilityResponse>;
export type PaymentIntentApiResponse = ApiResponse<PaymentIntentResponse>;
export type BookingConfirmationApiResponse =
  ApiResponse<BookingConfirmationResponse>;
