import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  MarinaRegistrationRequest,
  MarinaRegistrationResponse,
} from "@shared/api";

// ─── State ────────────────────────────────────────────────────────────────────

export interface HostOnboardingFormData {
  // Step 1 – Venue type
  business_type_id: number; // 1=Full Service, 2=Dry Storage, 3=Private Port, 4=Yacht Club

  // Step 2 – Basic info
  name: string;
  description: string;
  price_per_day: string; // kept as string for form input

  // Step 3 – Location
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;

  // Step 4 – Facilities
  total_slips: string;
  max_boat_length_meters: string;
  max_boat_draft_meters: string;
  has_fuel_dock: boolean;
  has_pump_out: boolean;
  has_haul_out: boolean;
  has_boat_ramp: boolean;
  has_dry_storage: boolean;
  has_live_aboard: boolean;
  accepts_transients: boolean;
  accepts_megayachts: boolean;

  // Step 6 – Amenities
  amenity_ids: number[];

  // Step 4 – Seabed
  seabed_type_id: number; // 0 = not selected / skip
  seabed_depth_meters: string;
  seabed_description: string;
  seabed_notes: string;

  // Step 7 – Gallery
  cover_image_url: string;
  gallery_image_urls: string[];
  temp_upload_id: string;

  // Step 8 – Contact
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;

  // Step 9 – Host account
  host_name: string;
  host_email: string;
  host_phone: string;
  company_name: string;
}

interface HostOnboardingState {
  currentStep: number;
  totalSteps: number;
  formData: HostOnboardingFormData;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  registeredMarinaId: number | null;
}

const initialFormData: HostOnboardingFormData = {
  business_type_id: 1,
  name: "",
  description: "",
  price_per_day: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  latitude: "",
  longitude: "",
  total_slips: "",
  max_boat_length_meters: "",
  max_boat_draft_meters: "",
  has_fuel_dock: false,
  has_pump_out: false,
  has_haul_out: false,
  has_boat_ramp: false,
  has_dry_storage: false,
  has_live_aboard: false,
  accepts_transients: true,
  accepts_megayachts: false,
  amenity_ids: [],
  seabed_type_id: 0,
  seabed_depth_meters: "",
  seabed_description: "",
  seabed_notes: "",
  cover_image_url: "",
  gallery_image_urls: [],
  temp_upload_id: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  website_url: "",
  host_name: "",
  host_email: "",
  host_phone: "",
  company_name: "",
};

const initialState: HostOnboardingState = {
  currentStep: 1,
  totalSteps: 10,
  formData: initialFormData,
  submitting: false,
  submitted: false,
  error: null,
  registeredMarinaId: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const submitMarinaRegistration = createAsyncThunk<
  MarinaRegistrationResponse,
  MarinaRegistrationRequest
>("hostOnboarding/submitMarinaRegistration", async (payload) => {
  const { data } = await axios.post<MarinaRegistrationResponse>(
    "/api/marina-registration",
    payload,
  );
  return data;
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const hostOnboardingSlice = createSlice({
  name: "hostOnboarding",
  initialState,
  reducers: {
    nextStep(state) {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    prevStep(state) {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    goToStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    updateFormData(
      state,
      action: PayloadAction<Partial<HostOnboardingFormData>>,
    ) {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetOnboarding(state) {
      state.currentStep = 1;
      state.formData = initialFormData;
      state.submitting = false;
      state.submitted = false;
      state.error = null;
      state.registeredMarinaId = null;
    },
    toggleAmenity(state, action: PayloadAction<number>) {
      const id = action.payload;
      const exists = state.formData.amenity_ids.includes(id);
      state.formData.amenity_ids = exists
        ? state.formData.amenity_ids.filter((a) => a !== id)
        : [...state.formData.amenity_ids, id];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitMarinaRegistration.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitMarinaRegistration.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitted = true;
        state.registeredMarinaId = action.payload.marina_id ?? null;
      })
      .addCase(submitMarinaRegistration.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message ?? "Submission failed";
      });
  },
});

export const {
  nextStep,
  prevStep,
  goToStep,
  updateFormData,
  resetOnboarding,
  toggleAmenity,
} = hostOnboardingSlice.actions;

export default hostOnboardingSlice.reducer;
