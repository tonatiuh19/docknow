import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  Marina,
  MarinaDetailsApiResponse,
  MarinaAvailabilityApiResponse,
  Slip,
} from "@shared/api";

// Use explicit API base URL when set (e.g. production when UI and API are on different origins)
const apiBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

// Extended marina details interface for detailed view
export interface MarinaDetail {
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
  business_type_name?: string;
  avg_rating?: number;
  review_count?: number;
  primary_image_url?: string;
  total_images?: number;

  // Extended fields for detailed view
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
  capacity: {
    totalSlips: number;
    availableSlips: number;
    maxBoatLength: number;
    maxBoatWidth: number;
    maxBoatDraft: number;
  };
  businessType: {
    name: string;
    description: string;
  };
  rating: {
    average: string;
    count: number;
  };
  images: Array<{
    id: number;
    url: string;
    title: string;
    isPrimary: boolean;
  }>;
  amenities: Array<{
    id: number;
    name: string;
    icon: string;
    category: string;
  }>;
  reviews: any[];
  availability: {
    blockedDates: Array<{
      date: string;
      reason: string;
      slipId?: number;
      slipNumber?: string;
      startTime?: string | null;
      endTime?: string | null;
      isAllDay?: number;
    }>;
    bookedDates: Array<{ checkIn: string; checkOut: string }>;
  };
  coupons: any[];
}

// Availability data structure
export interface MarinaAvailability {
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

// Date range for booking selection (stored as ISO strings for Redux serialization)
export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}

// Async thunks for API calls
export const fetchMarinaDetail = createAsyncThunk(
  "marinaDetail/fetchMarinaDetail",
  async (slug: string) => {
    const { data } = await axios.get<MarinaDetailsApiResponse>(
      `${apiBaseURL}/api/marinas/${slug}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch marina details");
    }

    return data.data;
  },
);

export const fetchMarinaAvailability = createAsyncThunk(
  "marinaDetail/fetchMarinaAvailability",
  async (params: { marinaId: number; checkIn?: string; checkOut?: string }) => {
    const { data } = await axios.get<MarinaAvailabilityApiResponse>(
      `${apiBaseURL}/api/marinas/availability`,
      {
        params,
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch marina availability");
    }

    return data.data;
  },
);

// State interface
export interface MarinaDetailState {
  marina: MarinaDetail | null;
  availability: MarinaAvailability | null;
  selectedDateRange: DateRange;
  selectedSlip: number | null;
  loading: {
    marina: boolean;
    availability: boolean;
  };
  errors: {
    marina: string | null;
    availability: string | null;
  };
}

// Initial state
const initialState: MarinaDetailState = {
  marina: null,
  availability: null,
  selectedDateRange: {
    checkIn: null,
    checkOut: null,
  },
  selectedSlip: null,
  loading: {
    marina: false,
    availability: false,
  },
  errors: {
    marina: null,
    availability: null,
  },
};

// Slice
const marinaDetailSlice = createSlice({
  name: "marinaDetail",
  initialState,
  reducers: {
    setSelectedDateRange: (state, action: PayloadAction<DateRange>) => {
      state.selectedDateRange = action.payload;
    },
    setSelectedSlip: (state, action: PayloadAction<number | null>) => {
      state.selectedSlip = action.payload;
    },
    clearMarinaDetail: (state) => {
      state.marina = null;
      state.availability = null;
      state.selectedDateRange = { checkIn: null, checkOut: null };
      state.selectedSlip = null;
      state.errors = { marina: null, availability: null };
    },
    clearErrors: (state) => {
      state.errors = { marina: null, availability: null };
    },
  },
  extraReducers: (builder) => {
    // Fetch marina detail
    builder
      .addCase(fetchMarinaDetail.pending, (state) => {
        state.loading.marina = true;
        state.errors.marina = null;
      })
      .addCase(fetchMarinaDetail.fulfilled, (state, action) => {
        state.loading.marina = false;
        state.marina = action.payload;
      })
      .addCase(fetchMarinaDetail.rejected, (state, action) => {
        state.loading.marina = false;
        state.errors.marina =
          action.error.message || "Failed to fetch marina details";
      })

      // Fetch marina availability
      .addCase(fetchMarinaAvailability.pending, (state) => {
        state.loading.availability = true;
        state.errors.availability = null;
      })
      .addCase(fetchMarinaAvailability.fulfilled, (state, action) => {
        state.loading.availability = false;
        state.availability = action.payload;
      })
      .addCase(fetchMarinaAvailability.rejected, (state, action) => {
        state.loading.availability = false;
        state.errors.availability =
          action.error.message || "Failed to fetch availability";
      });
  },
});

// Export actions
export const {
  setSelectedDateRange,
  setSelectedSlip,
  clearMarinaDetail,
  clearErrors,
} = marinaDetailSlice.actions;

// Export reducer
export default marinaDetailSlice.reducer;
