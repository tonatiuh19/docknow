import { StateCreator } from "zustand";

export interface BookingState {
  marinaData: any | null;
  checkIn: string | null;
  checkOut: string | null;
  selectedSlipId: number | null;
  specialRequests: string;
  appliedCoupon: any | null;
  pricing: {
    days: number;
    subtotal: number;
    serviceFee: number;
    discountAmount: number;
    total: number;
  } | null;
  completedBookingId: number | null;
}

export interface BookingSlice extends BookingState {
  // Actions
  setMarinaData: (marinaData: any) => void;
  setCheckInOut: (checkIn: string, checkOut: string) => void;
  setSelectedSlipId: (slipId: number | null) => void;
  setSpecialRequests: (requests: string) => void;
  setAppliedCoupon: (coupon: any) => void;
  setPricing: (pricing: BookingState["pricing"]) => void;
  setCompletedBookingId: (id: number) => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  marinaData: null,
  checkIn: null,
  checkOut: null,
  selectedSlipId: null,
  specialRequests: "",
  appliedCoupon: null,
  pricing: null,
  completedBookingId: null,
};

export const createBookingSlice: StateCreator<BookingSlice> = (set) => ({
  ...initialState,

  setMarinaData: (marinaData: any) => {
    set({ marinaData });
  },

  setCheckInOut: (checkIn: string, checkOut: string) => {
    set({ checkIn, checkOut });
  },

  setSelectedSlipId: (selectedSlipId: number | null) => {
    set({ selectedSlipId });
  },

  setSpecialRequests: (specialRequests: string) => {
    set({ specialRequests });
  },

  setAppliedCoupon: (appliedCoupon: any) => {
    set({ appliedCoupon });
  },

  setPricing: (pricing: BookingState["pricing"]) => {
    set({ pricing });
  },

  setCompletedBookingId: (completedBookingId: number) => {
    set({ completedBookingId });
  },

  resetBooking: () => {
    set(initialState);
  },
});
