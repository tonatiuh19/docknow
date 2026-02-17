import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../index";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  totalMarinas: number;
  recentBookings: any[];
  revenueByMonth: any[];
  bookingsByStatus: any[];
}

interface AdminDashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

// Fetch dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  "adminDashboard/fetchStats",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      const { data } = await axios.get("/api/host/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch dashboard statistics",
      );
    }
  },
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
