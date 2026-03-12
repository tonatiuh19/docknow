import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { BookingServiceType } from "@shared/api";

const apiBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

interface Marina {
  id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
}

interface Slip {
  number: string;
  length: number;
  width: number;
}

interface Boat {
  id: number;
  name: string;
  model: string;
  manufacturer: string;
  length: number;
  width: number;
}

interface Reservation {
  id: number;
  serviceType: BookingServiceType;
  checkInDate: string;
  checkOutDate: string;
  totalDays: number;
  pricePerDay: number;
  subtotal: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "pending_approval";
  stripePaymentIntentId?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  marina: Marina;
  slip?: Slip;
  boat: Boat;
}

interface ReservationsState {
  reservations: Reservation[];
  filteredReservations: Reservation[];
  selectedStatus: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReservationsState = {
  reservations: [],
  filteredReservations: [],
  selectedStatus: "all",
  isLoading: false,
  error: null,
};

// Fetch user's reservations
export const fetchReservations = createAsyncThunk(
  "reservations/fetchReservations",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const params = status && status !== "all" ? { status } : {};
      const { data } = await axios.get(
        `${apiBaseURL}/api/bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load reservations",
      );
    }
  },
);

const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.selectedStatus = action.payload;
      state.filteredReservations =
        action.payload === "all"
          ? state.reservations
          : state.reservations.filter(
              (reservation) => reservation.status === action.payload,
            );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReservations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchReservations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.reservations = action.payload;
      state.filteredReservations =
        state.selectedStatus === "all"
          ? action.payload
          : action.payload.filter(
              (reservation: Reservation) =>
                reservation.status === state.selectedStatus,
            );
    });
    builder.addCase(fetchReservations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setStatusFilter, clearError } = reservationsSlice.actions;
export default reservationsSlice.reducer;
