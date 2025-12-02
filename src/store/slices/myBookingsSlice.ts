import { StateCreator } from "zustand";

export interface CancellationRequest {
  id: number;
  bookingId: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  adminNotes: string | null;
  refundAmount: number | null;
  refundPercentage: number | null;
  requestedAt: string;
  respondedAt: string | null;
  marinaName: string;
  marinaSlug: string;
  marinaCity: string;
  marinaState: string;
  slipNumber: string | null;
  responderName: string | null;
}

export interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalDays: number;
  pricePerDay: number;
  subtotal: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  stripePaymentIntentId: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
  marina: {
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
  };
  slip: {
    number: string;
    length: number;
    width: number;
  } | null;
  boat: {
    id: number;
    name: string;
    model: string;
    manufacturer: string;
    length: number;
    width: number;
  };
  cancellationRequest?: CancellationRequest;
}

export interface MyBookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  selectedStatus: "all" | "pending" | "confirmed" | "cancelled" | "completed";
  cancellationRequests: CancellationRequest[];
  loadingCancellationRequests: boolean;
}

export interface MyBookingsActions {
  fetchMyBookings: (status?: string) => Promise<void>;
  requestCancellation: (bookingId: number, reason: string) => Promise<void>;
  fetchCancellationRequests: (bookingId?: number) => Promise<void>;
  setSelectedStatus: (
    status: "all" | "pending" | "confirmed" | "cancelled" | "completed"
  ) => void;
  clearBookings: () => void;
}

export type MyBookingsSlice = MyBookingsState & MyBookingsActions;

export const createMyBookingsSlice: StateCreator<MyBookingsSlice> = (
  set,
  get
) => ({
  bookings: [],
  isLoading: false,
  error: null,
  selectedStatus: "all",
  cancellationRequests: [],
  loadingCancellationRequests: false,

  fetchMyBookings: async (status?: string) => {
    console.log("fetchMyBookings called with status:", status);
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      console.log("Token from localStorage:", token ? "exists" : "missing");

      if (!token) {
        throw new Error("Not authenticated");
      }

      const url =
        status && status !== "all"
          ? `/api/bookings/my-bookings?status=${status}`
          : "/api/bookings/my-bookings";

      console.log("Fetching from URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status, response.ok);

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      console.log("API returned data:", data);
      set({ bookings: data.data, isLoading: false });

      // Also fetch cancellation requests
      await get().fetchCancellationRequests();
    } catch (error) {
      console.error("fetchMyBookings error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
        isLoading: false,
      });
    }
  },

  requestCancellation: async (bookingId: number, reason: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit cancellation request");
      }

      // Refresh bookings and cancellation requests
      await get().fetchMyBookings(
        get().selectedStatus === "all" ? undefined : get().selectedStatus
      );
    } catch (error) {
      throw error;
    }
  },

  fetchCancellationRequests: async (bookingId?: number) => {
    set({ loadingCancellationRequests: true });
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const url = bookingId
        ? `/api/bookings/cancellation-requests?bookingId=${bookingId}`
        : "/api/bookings/cancellation-requests";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cancellation requests");
      }

      const data = await response.json();
      set({
        cancellationRequests: data.data,
        loadingCancellationRequests: false,
      });
    } catch (error) {
      console.error("Error fetching cancellation requests:", error);
      set({ loadingCancellationRequests: false });
    }
  },

  setSelectedStatus: (status) => {
    set({ selectedStatus: status });
    get().fetchMyBookings(status === "all" ? undefined : status);
  },

  clearBookings: () => {
    set({
      bookings: [],
      isLoading: false,
      error: null,
      selectedStatus: "all",
      cancellationRequests: [],
      loadingCancellationRequests: false,
    });
  },
});
