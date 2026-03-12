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
  is_directory_only?: boolean; // true = public directory listing, not bookable on DockNow
  created_at: string;
  updated_at: string;

  // Additional fields from API joins
  business_type_name?: string;
  amenities?: string; // comma-separated amenity names
  avg_rating?: number;
  review_count?: number;
  primary_image_url?: string; // cover_image_url from marinas table
  total_images?: number | null;
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

// Marina image — derived from cover_image_url and gallery_image_urls columns on marinas table
export interface MarinaImage {
  url: string;
  title: string;
  isPrimary: boolean;
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

// Per-marina service type pricing (from marina_service_type_pricing table)
export interface MarinaServiceTypePricing {
  service_type: BookingServiceType;
  price_per_day: number;
  is_available: boolean;
  description?: string | null;
}

// Booking service type
export type BookingServiceType = "slip" | "dry_stack" | "shipyard_maintenance";

export const BOOKING_SERVICE_TYPES: Record<
  BookingServiceType,
  { label: string; description: string; icon: string }
> = {
  slip: {
    label: "Marina Slip",
    description: "Standard boat slip reservation at the marina dock.",
    icon: "Anchor",
  },
  dry_stack: {
    label: "Dry Stack",
    description:
      "Forklift-based dry storage — your boat is stacked ashore and launched on demand.",
    icon: "Layers",
  },
  shipyard_maintenance: {
    label: "Shipyard Maintenance",
    description:
      "Haul-out, bottom paint, engine service, and full shipyard work.",
    icon: "Wrench",
  },
};

// Payment related types
export interface PaymentIntentRequest {
  userId: number;
  marinaId: number;
  boatId: number;
  slipId?: number;
  paymentMethodId?: string;
  checkIn: string;
  checkOut: string;
  couponCode?: string;
  specialRequests?: string;
  serviceType?: BookingServiceType;
  /**
   * Set to `true` when the request originates from the mobile app.
   * When true, the server fetches the Stripe secret key from the `environment_keys`
   * database table instead of the STRIPE_SECRET_KEY environment variable.
   * Defaults to `false` (web).
   */
  isMobileApp?: boolean;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  bookingId: number;
  totalAmount: number;
}

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
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

// Marina / Private Port Registration (Become a Member)
export interface MarinaRegistrationRequest {
  // Host info
  host_name: string;
  host_email: string;
  host_phone?: string;
  company_name?: string;

  // Venue type & basic info
  business_type_id: number; // 1=Full Service, 2=Dry Storage, 3=Private Port, 4=Yacht Club
  name: string;
  description: string;
  price_per_day: number;

  // Location
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude: number;
  longitude: number;

  // Contact
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;

  // Facilities
  total_slips: number;
  max_boat_length_meters?: number;
  max_boat_draft_meters?: number;

  // Marina features
  has_fuel_dock?: boolean;
  has_pump_out?: boolean;
  has_haul_out?: boolean;
  has_boat_ramp?: boolean;
  has_dry_storage?: boolean;
  has_live_aboard?: boolean;
  accepts_transients?: boolean;
  accepts_megayachts?: boolean;

  // Amenities (IDs from amenity_types)
  amenity_ids?: number[];

  // Seabed info (references seabeds + seabed_types tables)
  seabed_type_id?: number; // FK → seabed_types.id
  seabed_depth_meters?: number;
  seabed_description?: string;
  seabed_notes?: string;

  // Gallery images (uploaded via external API before submission)
  cover_image_url?: string;
  gallery_image_urls?: string[]; // JSON-serialised array stored in marinas.gallery_image_urls
  temp_upload_id?: string; // Temp folder ID used for image uploads, e.g. "marina-temp-1234"
}

export interface MarinaRegistrationResponse {
  success: boolean;
  message: string;
  marina_id?: number;
}

// Popular destination (city-level grouping)
export interface PopularDestination {
  city: string;
  state: string | null;
  country: string;
  image_url: string | null;
  avg_rating: number | null;
  marina_count: number;
}

export type PopularDestinationsApiResponse = ApiResponse<PopularDestination[]>;

// API endpoint types
export type HealthResponse = ApiResponse<{ status: string; timestamp: string }>;
export type MarinaSearchApiResponse = ApiResponse<MarinaSearchResponse>;
export type MarinaFiltersApiResponse = ApiResponse<MarinaFiltersResponse>;
export type MarinaDetailsApiResponse = ApiResponse<any>;
export type MarinaAvailabilityApiResponse = ApiResponse<AvailabilityResponse>;
export type PaymentIntentApiResponse = ApiResponse<PaymentIntentResponse>;
export type BookingConfirmationApiResponse =
  ApiResponse<BookingConfirmationResponse>;
