import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";

// Base selector
const selectDiscoveryState = (state: RootState) => state.discovery;

// Basic selectors
export const selectMarinas = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.marinas,
);

export const selectMarinaFilters = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.filters,
);

export const selectSearchParams = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.searchParams,
);

export const selectPagination = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.pagination,
);

export const selectViewType = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.viewType,
);

export const selectSelectedMarina = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.selectedMarina,
);

// Loading selectors
export const selectMarinaLoading = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.loading.marinas,
);

export const selectFiltersLoading = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.loading.filters,
);

export const selectSearchLoading = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.loading.search,
);

export const selectLoadMoreLoading = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.loading.loadMore,
);

export const selectIsAnyLoading = createSelector(
  selectDiscoveryState,
  (discovery) => Object.values(discovery.loading).some((loading) => loading),
);

// Error selectors
export const selectMarinaError = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.errors.marinas,
);

export const selectFiltersError = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.errors.filters,
);

export const selectSearchError = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.errors.search,
);

export const selectLoadMoreError = createSelector(
  selectDiscoveryState,
  (discovery) => discovery.errors.loadMore,
);

export const selectAnyError = createSelector(
  selectDiscoveryState,
  (discovery) =>
    Object.values(discovery.errors).find((error) => error !== null),
);

// Derived data selectors
export const selectFeaturedMarinas = createSelector(selectMarinas, (marinas) =>
  marinas.filter((marina) => marina.is_featured),
);

export const selectMarinasWithRatings = createSelector(
  selectMarinas,
  (marinas) =>
    marinas.filter((marina) => marina.avg_rating && marina.avg_rating > 0),
);

export const selectAveragePrice = createSelector(selectMarinas, (marinas) => {
  if (marinas.length === 0) return 0;
  const total = marinas.reduce((sum, marina) => sum + marina.price_per_day, 0);
  return total / marinas.length;
});

export const selectUniqueLocations = createSelector(
  selectMarinas,
  (marinas) => {
    const uniqueLocations = new Set<string>();
    return marinas
      .filter((marina) => {
        const locationKey = `${marina.city}, ${marina.state || marina.country}`;
        if (uniqueLocations.has(locationKey)) {
          return false;
        }
        uniqueLocations.add(locationKey);
        return true;
      })
      .map((marina) => ({
        city: marina.city,
        state: marina.state,
        country: marina.country,
        label: `${marina.city}, ${marina.state || marina.country}`,
      }));
  },
);

export const selectMarinasGroupedByLocation = createSelector(
  selectMarinas,
  (marinas) => {
    return marinas.reduce(
      (acc, marina) => {
        const locationKey = `${marina.city}, ${marina.state || marina.country}`;
        if (!acc[locationKey]) {
          acc[locationKey] = [];
        }
        acc[locationKey].push(marina);
        return acc;
      },
      {} as Record<string, typeof marinas>,
    );
  },
);

// Search and filter selectors
export const selectHasActiveFilters = createSelector(
  selectSearchParams,
  (params) => {
    const {
      city,
      state,
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      amenities,
      businessTypeId,
      minBoatLength,
      maxBoatLength,
      minDraft,
      searchTerm,
      featured,
    } = params;

    return !!(
      city ||
      state ||
      checkIn ||
      checkOut ||
      minPrice ||
      maxPrice ||
      (amenities && amenities.length > 0) ||
      businessTypeId ||
      minBoatLength ||
      maxBoatLength ||
      minDraft ||
      searchTerm ||
      featured
    );
  },
);

export const selectCanLoadMore = createSelector(
  selectPagination,
  selectLoadMoreLoading,
  (pagination, loading) => pagination.hasMore && !loading,
);

// Combined selectors for UI components
export const selectDiscoveryViewData = createSelector(
  selectMarinas,
  selectViewType,
  selectMarinaLoading,
  selectSearchLoading,
  selectIsAnyLoading,
  (marinas, viewType, marinaLoading, searchLoading, isAnyLoading) => ({
    marinas,
    viewType,
    loading: marinaLoading || searchLoading || isAnyLoading,
  }),
);

export const selectFilterOptionsData = createSelector(
  selectMarinaFilters,
  selectFiltersLoading,
  selectFiltersError,
  (filters, loading, error) => ({
    filters,
    loading,
    error,
  }),
);

export const selectSearchBarData = createSelector(
  selectSearchParams,
  selectSearchLoading,
  selectHasActiveFilters,
  (searchParams, loading, hasActiveFilters) => ({
    query: searchParams.searchTerm || "",
    location: searchParams.city || "",
    checkIn: searchParams.checkIn || "",
    checkOut: searchParams.checkOut || "",
    loading,
    hasActiveFilters,
  }),
);
