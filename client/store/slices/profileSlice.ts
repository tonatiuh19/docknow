import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const apiBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

interface ProfileUpdateData {
  full_name: string;
  date_of_birth?: string;
  phone?: string;
  phone_code?: string;
  country_code?: string;
  profile_image_url?: string;
  general_notifications: boolean;
  marketing_notifications: boolean;
}

interface ProfileState {
  profile: ProfileUpdateData | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  updateSuccess: false,
};

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as any;
      const token = auth.token || localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token");
      }

      const { data } = await axios.get(`${apiBaseURL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch profile",
      );
    }
  },
);

// Update user profile
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profileData: ProfileUpdateData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as any;
      const token = auth.token || localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token");
      }

      const { data } = await axios.put(
        `${apiBaseURL}/api/profile/me`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update profile",
      );
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetProfileState: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.isUpdating = false;
      state.error = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.profile = action.payload;
      state.updateSuccess = true;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload as string;
      state.updateSuccess = false;
    });
  },
});

export const { clearError, clearUpdateSuccess, resetProfileState } =
  profileSlice.actions;
export default profileSlice.reducer;
