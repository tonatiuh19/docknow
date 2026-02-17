import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Types
export interface PaymentData {
  booking_id: number;
  total_amount: number;
  booking_date: string;
  status: string;
  stripe_payment_intent_id: string | null;
  marina_name: string;
  guest_name: string;
  guest_email: string;
  stripe_status?: string;
  stripe_amount?: number;
  stripe_currency?: string;
  stripe_created?: string;
  stripe_payment_method?: string;
  stripe_error?: string;
}

export interface PaymentTotals {
  pending_payout: number;
  total_earned: number;
  total_transactions: number;
}

interface AdminPaymentsState {
  payments: PaymentData[];
  totals: PaymentTotals;
  loading: boolean;
  error: string | null;
}

const initialState: AdminPaymentsState = {
  payments: [],
  totals: {
    pending_payout: 0,
    total_earned: 0,
    total_transactions: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchAdminPayments = createAsyncThunk(
  "adminPayments/fetchPayments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as any;
      const { data } = await axios.get("/api/host/payments", {
        headers: { Authorization: `Bearer ${hostAuth.sessionToken}` },
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch payments");
      }

      return {
        payments: data.payments || [],
        totals: data.totals || initialState.totals,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Slice
const adminPaymentsSlice = createSlice({
  name: "adminPayments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPayments: (state) => {
      state.payments = [];
      state.totals = initialState.totals;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.totals = action.payload.totals;
        state.error = null;
      })
      .addCase(fetchAdminPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPayments } = adminPaymentsSlice.actions;
export default adminPaymentsSlice.reducer;
