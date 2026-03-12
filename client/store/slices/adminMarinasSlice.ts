import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../index";
import type { MarinaServiceTypePricing, BookingServiceType } from "@shared/api";

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface MarinaFeature {
  id: number;
  has_fuel_dock: boolean;
  has_pump_out: boolean;
  has_haul_out: boolean;
  has_boat_ramp: boolean;
  has_dry_storage: boolean;
  has_live_aboard: boolean;
  max_haul_out_weight_tons: number | null;
  accepts_transients: boolean;
  accepts_megayachts: boolean;
  updated_at: string;
}

interface SlipItem {
  id: number;
  slip_number: string;
  length_meters: number | null;
  width_meters: number | null;
  depth_meters: number | null;
  price_per_day: number;
  is_available: boolean;
  is_reserved: boolean;
  has_power: boolean;
  has_water: boolean;
  power_capacity_amps: number | null;
  notes: string | null;
  updated_at: string;
}

interface AmenityItem {
  id: number;
  amenity_id: number;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
}

interface AnchorageItem {
  id: number;
  anchorage_type_id: number;
  anchorage_type_name: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  max_depth_meters: number | null;
  min_depth_meters: number | null;
  capacity: number | null;
  price_per_day: number | null;
  protection_level: string;
  is_available: boolean;
  updated_at: string;
}

interface SeabedItem {
  id: number;
  anchorage_id: number | null;
  seabed_type_id: number;
  seabed_type_name: string;
  seabed_type_slug: string;
  holding_quality: string;
  description: string | null;
  depth_meters: number | null;
  notes: string | null;
  created_at: string;
}

interface MooringItem {
  id: number;
  mooring_type_id: number;
  mooring_type_name: string;
  mooring_number: string;
  description: string | null;
  max_boat_length_meters: number | null;
  max_boat_weight_tons: number | null;
  depth_meters: number | null;
  price_per_day: number | null;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
}

interface PointItem {
  id: number;
  point_type_id: number;
  point_type_name: string;
  point_type_slug: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  is_public: boolean;
  is_active: boolean;
  contact_info: string | null;
  operating_hours: string | null;
  updated_at: string;
}

interface MarinaImageItem {
  id: number;
  image_url: string;
  title: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface MarinaManagementItem {
  id: number;
  name: string;
  city: string;
  state: string | null;
  country: string;
  is_active: number;
  updated_at: string;
  marina_price_per_day: number;
  marina_features: MarinaFeature | null;
  slips: SlipItem[];
  amenities: AmenityItem[];
  anchorages: AnchorageItem[];
  seabeds: SeabedItem[];
  moorings: MooringItem[];
  points: PointItem[];
  images: MarinaImageItem[];
  pricing: {
    slips: PriceRange;
    moorings: PriceRange;
    anchorages: PriceRange;
  };
}

interface AdminMarinasState {
  marinas: MarinaManagementItem[];
  isLoading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AdminMarinasState = {
  marinas: [],
  isLoading: false,
  saving: false,
  error: null,
};

export const fetchHostMarinaManagement = createAsyncThunk(
  "adminMarinas/fetchHostMarinaManagement",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      const { data } = await axios.get("/api/host/marina-management", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.marinas as MarinaManagementItem[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch marina management data",
      );
    }
  },
);

export const saveMarinaFeatures = createAsyncThunk(
  "adminMarinas/saveMarinaFeatures",
  async (
    payload: { marinaId: number; features: Record<string, unknown> },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/marina-features", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to save marina features",
      );
    }
  },
);

export const saveMarinaAmenities = createAsyncThunk(
  "adminMarinas/saveMarinaAmenities",
  async (
    payload: { marinaId: number; amenityIds: number[] },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/amenities", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to save marina amenities",
      );
    }
  },
);

export const manageMarinaSlips = createAsyncThunk(
  "adminMarinas/manageMarinaSlips",
  async (
    payload: {
      action: "create" | "update" | "delete";
      marinaId?: number;
      slipId?: number;
      slip?: Record<string, unknown>;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/slips", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to manage slips",
      );
    }
  },
);

export const manageMarinaAnchorages = createAsyncThunk(
  "adminMarinas/manageMarinaAnchorages",
  async (
    payload: {
      action: "create" | "update" | "delete";
      marinaId?: number;
      anchorageId?: number;
      anchorage?: Record<string, unknown>;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/anchorages", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to manage anchorages",
      );
    }
  },
);

export const manageMarinaSeabeds = createAsyncThunk(
  "adminMarinas/manageMarinaSeabeds",
  async (
    payload: {
      action: "create" | "update" | "delete";
      marinaId?: number;
      seabedId?: number;
      seabed?: Record<string, unknown>;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/seabeds", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to manage seabeds",
      );
    }
  },
);

export const manageMarinaMoorings = createAsyncThunk(
  "adminMarinas/manageMarinaMoorings",
  async (
    payload: {
      action: "create" | "update" | "delete";
      marinaId?: number;
      mooringId?: number;
      mooring?: Record<string, unknown>;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/moorings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to manage moorings",
      );
    }
  },
);

export const manageMarinaPoints = createAsyncThunk(
  "adminMarinas/manageMarinaPoints",
  async (
    payload: {
      action: "create" | "update" | "delete";
      marinaId?: number;
      pointId?: number;
      point?: Record<string, unknown>;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/points", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to manage points",
      );
    }
  },
);

export const manageMarinaImages = createAsyncThunk(
  "adminMarinas/manageMarinaImages",
  async (
    payload: {
      action: "create" | "delete";
      marinaId?: number;
      imageUrl?: string;
      image?: {
        image_url?: string;
        title?: string;
        display_order?: number;
        is_primary?: boolean;
      };
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/marina-management/images", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to manage marina images",
      );
    }
  },
);

export const uploadMarinaImage = createAsyncThunk(
  "adminMarinas/uploadMarinaImage",
  async (
    payload: {
      marinaId: number;
      file: File;
      imageType: "main" | "extra";
      title?: string;
      displayOrder?: number;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("main_folder", "docknow");
      formData.append("id", String(payload.marinaId));

      if (payload.imageType === "main") {
        formData.append("main_image", payload.file);
      } else {
        formData.append("images[]", payload.file);
      }

      const response = await axios.post(
        "https://disruptinglabs.com/data/api/uploadImages.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Image upload failed");
      }

      const uploaded =
        payload.imageType === "main"
          ? response.data?.main_image
          : response.data?.extra_images?.[0];

      if (!uploaded?.path) {
        throw new Error("No uploaded image path returned");
      }

      const imageUrl = uploaded.path.startsWith("http")
        ? uploaded.path
        : `https://disruptinglabs.com${uploaded.path}`;

      await dispatch(
        manageMarinaImages({
          action: "create",
          marinaId: payload.marinaId,
          image: {
            image_url: imageUrl,
            title: payload.title || payload.file.name,
            display_order: payload.displayOrder ?? 0,
            is_primary: payload.imageType === "main",
          },
        }),
      ).unwrap();

      return {
        marinaId: payload.marinaId,
        imageUrl,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message ||
          error.response?.data?.error ||
          "Failed to upload image",
      );
    }
  },
);

export const deleteMarinaImage = createAsyncThunk(
  "adminMarinas/deleteMarinaImage",
  async (
    payload: {
      marinaId: number;
      imageUrl: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const fileName = payload.imageUrl.split("/").pop();
      const imageType = payload.imageUrl.includes("/main_image/")
        ? "main"
        : "extra";

      if (fileName && payload.imageUrl.includes("disruptinglabs.com/data/")) {
        try {
          await axios.delete(
            "https://disruptinglabs.com/data/api/uploadImages.php",
            {
              data: {
                main_folder: "docknow",
                id: String(payload.marinaId),
                filename: fileName,
                image_type: imageType,
              },
            },
          );
        } catch {
          // Continue and remove database reference even if remote file is not found.
        }
      }

      await dispatch(
        manageMarinaImages({
          action: "delete",
          marinaId: payload.marinaId,
          imageUrl: payload.imageUrl,
        }),
      ).unwrap();

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.message ||
          error.response?.data?.error ||
          "Failed to delete image",
      );
    }
  },
);

export const fetchMarinaServicePricing = createAsyncThunk(
  "adminMarinas/fetchMarinaServicePricing",
  async (marinaId: number, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as RootState;
      const { data } = await axios.get(
        `/api/host/marina-management/service-pricing/${marinaId}`,
        { headers: { Authorization: `Bearer ${hostAuth.sessionToken}` } },
      );
      return data.data as MarinaServiceTypePricing[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch service pricing",
      );
    }
  },
);

export const updateMarinaServicePricing = createAsyncThunk(
  "adminMarinas/updateMarinaServicePricing",
  async (
    payload: { marinaId: number; pricing: MarinaServiceTypePricing[] },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      await axios.put(
        `/api/host/marina-management/service-pricing/${payload.marinaId}`,
        { pricing: payload.pricing },
        { headers: { Authorization: `Bearer ${hostAuth.sessionToken}` } },
      );
      return payload.pricing;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update service pricing",
      );
    }
  },
);

const adminMarinasSlice = createSlice({
  name: "adminMarinas",
  initialState,
  reducers: {
    clearMarinasError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostMarinaManagement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHostMarinaManagement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.marinas = action.payload;
        state.error = null;
      })
      .addCase(fetchHostMarinaManagement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(saveMarinaFeatures.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveMarinaFeatures.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveMarinaFeatures.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(saveMarinaAmenities.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveMarinaAmenities.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveMarinaAmenities.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(manageMarinaSlips.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(manageMarinaSlips.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(manageMarinaSlips.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(manageMarinaAnchorages.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(manageMarinaAnchorages.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(manageMarinaAnchorages.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(manageMarinaSeabeds.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(manageMarinaSeabeds.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(manageMarinaSeabeds.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(manageMarinaMoorings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(manageMarinaMoorings.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(manageMarinaMoorings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(manageMarinaPoints.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(manageMarinaPoints.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(manageMarinaPoints.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(manageMarinaImages.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(manageMarinaImages.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(manageMarinaImages.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(uploadMarinaImage.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(uploadMarinaImage.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(uploadMarinaImage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMarinaImage.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteMarinaImage.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(deleteMarinaImage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMarinaServicePricing.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(fetchMarinaServicePricing.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(fetchMarinaServicePricing.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(updateMarinaServicePricing.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateMarinaServicePricing.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateMarinaServicePricing.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMarinasError } = adminMarinasSlice.actions;
export default adminMarinasSlice.reducer;
