import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../index";

interface Booking {
  id: number;
  user_id: number;
  slip_id: number | null;
  slip_number: string | null;
  marina_id: number;
  marina_name: string;
  marina_city: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  boat_id: number | null;
  boat_name: string | null;
  boat_type: string | null;
  boat_length: number | null;
  check_in_date: string;
  check_out_date: string;
  total_days: number;
  total_amount: number;
  status: string;
  requires_approval: number;
  approved_at: string | null;
  pre_checkout_completed: number;
  pre_checkout_completed_at: string | null;
  total_submissions: number;
  completed_submissions: number;
  created_at: string;
}

interface BlockedDate {
  id: number;
  marina_id: number;
  marina_name: string;
  slip_id: number | null;
  slip_number: string | null;
  blocked_date: string;
  reason: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: number;
  created_at: string;
}

interface HostMarina {
  id: number;
  name: string;
}

interface HostSlip {
  id: number;
  marina_id: number;
  marina_name: string;
  slip_number: string;
}

interface AdminBookingsState {
  bookings: Booking[];
  blockedDates: BlockedDate[];
  marinas: HostMarina[];
  slips: HostSlip[];
  isLoading: boolean;
  creatingBlock: boolean;
  error: string | null;
  filters: {
    status: string;
    marinaId: string;
  };
}

const initialState: AdminBookingsState = {
  bookings: [],
  blockedDates: [],
  marinas: [],
  slips: [],
  isLoading: false,
  creatingBlock: false,
  error: null,
  filters: {
    status: "all",
    marinaId: "all",
  },
};

// Fetch all bookings for host
export const fetchHostBookings = createAsyncThunk(
  "adminBookings/fetchHostBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      const { data } = await axios.get("/api/host/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.bookings;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch bookings",
      );
    }
  },
);

export const fetchHostBlockedDates = createAsyncThunk(
  "adminBookings/fetchHostBlockedDates",
  async (
    params: { marinaId?: number } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;
      const query = params?.marinaId ? `?marinaId=${params.marinaId}` : "";

      const { data } = await axios.get(`/api/host/blocked-dates${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.blockedDates as BlockedDate[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blocked dates",
      );
    }
  },
);

export const fetchHostMarinasForBookings = createAsyncThunk(
  "adminBookings/fetchHostMarinasForBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      const { data } = await axios.get("/api/host/marinas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.marinas as HostMarina[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch marinas",
      );
    }
  },
);

export const fetchHostSlipsForBookings = createAsyncThunk(
  "adminBookings/fetchHostSlipsForBookings",
  async (
    params: { marinaId?: number } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;
      const query = params?.marinaId ? `?marinaId=${params.marinaId}` : "";

      const { data } = await axios.get(`/api/host/slips${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.slips as HostSlip[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch slips",
      );
    }
  },
);

export const createHostBlockedDate = createAsyncThunk(
  "adminBookings/createHostBlockedDate",
  async (
    payload: {
      marinaId: number;
      slipId?: number | null;
      startDate: string;
      endDate?: string;
      reason: string;
      isAllDay: boolean;
      startTime?: string;
      endTime?: string;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const { hostAuth } = getState() as RootState;
      const token = hostAuth.sessionToken;

      await axios.post("/api/host/blocked-dates", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return payload;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create blocked date",
      );
    }
  },
);

const adminBookingsSlice = createSlice({
  name: "adminBookings",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBookingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHostBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
        state.error = null;
      })
      .addCase(fetchHostBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHostBlockedDates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHostBlockedDates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blockedDates = action.payload;
      })
      .addCase(fetchHostBlockedDates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHostMarinasForBookings.fulfilled, (state, action) => {
        state.marinas = action.payload;
      })
      .addCase(fetchHostSlipsForBookings.fulfilled, (state, action) => {
        state.slips = action.payload;
      })
      .addCase(createHostBlockedDate.pending, (state) => {
        state.creatingBlock = true;
        state.error = null;
      })
      .addCase(createHostBlockedDate.fulfilled, (state) => {
        state.creatingBlock = false;
      })
      .addCase(createHostBlockedDate.rejected, (state, action) => {
        state.creatingBlock = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearBookingsError } = adminBookingsSlice.actions;
export default adminBookingsSlice.reducer;
