import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";

// Base selector
const selectMarinaDetailState = (state: RootState) => state.marinaDetail;

// Basic selectors
export const selectMarinaDetail = createSelector(
  selectMarinaDetailState,
  (marinaDetail) => marinaDetail.marina,
);

export const selectMarinaAvailability = createSelector(
  selectMarinaDetailState,
  (marinaDetail) => marinaDetail.availability,
);

export const selectSelectedDateRange = createSelector(
  selectMarinaDetailState,
  (marinaDetail) => marinaDetail.selectedDateRange,
);

export const selectSelectedSlip = createSelector(
  selectMarinaDetailState,
  (marinaDetail) => marinaDetail.selectedSlip,
);

export const selectMarinaDetailLoading = createSelector(
  selectMarinaDetailState,
  (marinaDetail) => marinaDetail.loading,
);

export const selectMarinaDetailErrors = createSelector(
  selectMarinaDetailState,
  (marinaDetail) => marinaDetail.errors,
);

// Computed selectors
export const selectIsLoadingAnyDetail = createSelector(
  selectMarinaDetailLoading,
  (loading) => loading.marina || loading.availability,
);

export const selectHasDetailErrors = createSelector(
  selectMarinaDetailErrors,
  (errors) => Boolean(errors.marina || errors.availability),
);

export const selectMarinaImages = createSelector(
  selectMarinaDetail,
  (marina) => marina?.images || [],
);

export const selectPrimaryImage = createSelector(
  selectMarinaImages,
  (images) => images.find((img) => img.isPrimary) || images[0] || null,
);

export const selectMarinaAmenities = createSelector(
  selectMarinaDetail,
  (marina) => marina?.amenities || [],
);

export const selectMarinaLocation = createSelector(
  selectMarinaDetail,
  (marina) => marina?.location || null,
);

export const selectMarinaContact = createSelector(
  selectMarinaDetail,
  (marina) => marina?.contact || null,
);

export const selectMarinaCapacity = createSelector(
  selectMarinaDetail,
  (marina) => marina?.capacity || null,
);

export const selectMarinaRating = createSelector(
  selectMarinaDetail,
  (marina) => marina?.rating || { average: "0.0", count: 0 },
);

export const selectAvailableSlips = createSelector(
  selectMarinaAvailability,
  (availability) => availability?.availableSlips || [],
);

export const selectBookedDates = createSelector(
  selectMarinaAvailability,
  (availability) => availability?.bookedDates || [],
);

export const selectBlockedDates = createSelector(
  selectMarinaAvailability,
  (availability) => availability?.blockedDates || [],
);

// Date validation selectors
export const selectIsDateRangeValid = createSelector(
  selectSelectedDateRange,
  (dateRange) => {
    if (!dateRange.checkIn || !dateRange.checkOut) return false;
    return new Date(dateRange.checkIn) < new Date(dateRange.checkOut);
  },
);

export const selectBookingDuration = createSelector(
  selectSelectedDateRange,
  (dateRange) => {
    if (!dateRange.checkIn || !dateRange.checkOut) return 0;
    const checkIn = new Date(dateRange.checkIn);
    const checkOut = new Date(dateRange.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
);

// Calculate total booking cost
export const selectBookingCost = createSelector(
  [
    selectMarinaDetail,
    selectSelectedSlip,
    selectBookingDuration,
    selectAvailableSlips,
  ],
  (marina, selectedSlipId, duration, availableSlips) => {
    if (!marina || !selectedSlipId || !duration) return 0;

    const selectedSlip = availableSlips.find(
      (slip) => slip.id === selectedSlipId,
    );
    if (!selectedSlip) return marina.price_per_day * duration;

    return selectedSlip.pricePerDay * duration;
  },
);

export const selectSelectedSlipDetails = createSelector(
  [selectAvailableSlips, selectSelectedSlip],
  (availableSlips, selectedSlipId) => {
    if (!selectedSlipId) return null;
    return availableSlips.find((slip) => slip.id === selectedSlipId) || null;
  },
);
