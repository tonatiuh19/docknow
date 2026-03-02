import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  Marina,
  MarinaSearchParams,
  MarinaSearchApiResponse,
  MarinaFiltersApiResponse,
  MarinaFiltersResponse,
  Pagination,
  PopularDestination,
  PopularDestinationsApiResponse,
} from "@shared/api";

// Use explicit API base URL when set (e.g. production when UI and API are on different origins)
const apiBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

// Async thunks for API calls
export const fetchMarinas = createAsyncThunk(
  "discovery/fetchMarinas",
  async (params: MarinaSearchParams = {}) => {
    const { data } = await axios.get<MarinaSearchApiResponse>(
      `${apiBaseURL}/api/marinas/search`,
      {
        params: {
          ...params,
          limit: params.limit || 20,
          offset: params.offset || 0,
        },
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch marinas");
    }

    return data.data;
  },
);

export const fetchMarinaFilters = createAsyncThunk(
  "discovery/fetchMarinaFilters",
  async () => {
    const { data } = await axios.get<MarinaFiltersApiResponse>(
      `${apiBaseURL}/api/marinas/filters`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch marina filters");
    }

    return data.data;
  },
);

export const searchMarinas = createAsyncThunk(
  "discovery/searchMarinas",
  async (searchParams: MarinaSearchParams) => {
    const { data } = await axios.get<MarinaSearchApiResponse>(
      `${apiBaseURL}/api/marinas/search`,
      {
        params: searchParams,
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to search marinas");
    }

    return data.data;
  },
);

export const fetchPopularDestinations = createAsyncThunk(
  "discovery/fetchPopularDestinations",
  async (limit: number = 8) => {
    const { data } = await axios.get<PopularDestinationsApiResponse>(
      `${apiBaseURL}/api/marinas/popular-destinations`,
      { params: { limit } },
    );
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to fetch popular destinations");
    }
    return data.data;
  },
);

export const loadMoreMarinas = createAsyncThunk(
  "discovery/loadMoreMarinas",
  async (_, { getState }) => {
    const state = getState() as { discovery: DiscoveryState };
    const { searchParams, pagination } = state.discovery;

    const params = {
      ...searchParams,
      offset: pagination.offset + pagination.limit,
    };

    const { data } = await axios.get<MarinaSearchApiResponse>(
      `${apiBaseURL}/api/marinas/search`,
      {
        params,
      },
    );

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to load more marinas");
    }

    return data.data;
  },
);

// State interface
export interface DiscoveryState {
  marinas: Marina[];
  popularDestinations: PopularDestination[];
  filters: MarinaFiltersResponse | null;
  searchParams: MarinaSearchParams;
  pagination: Pagination;
  loading: {
    marinas: boolean;
    filters: boolean;
    search: boolean;
    loadMore: boolean;
    popularDestinations: boolean;
  };
  errors: {
    marinas: string | null;
    filters: string | null;
    search: string | null;
    loadMore: string | null;
    popularDestinations: string | null;
  };
  viewType: "list" | "map";
  selectedMarina: Marina | null;
}

// Initial state
const initialState: DiscoveryState = {
  marinas: [],
  popularDestinations: [],
  filters: null,
  searchParams: {
    limit: 20,
    offset: 0,
  },
  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  },
  loading: {
    marinas: false,
    filters: false,
    search: false,
    loadMore: false,
    popularDestinations: false,
  },
  errors: {
    marinas: null,
    filters: null,
    search: null,
    loadMore: null,
    popularDestinations: null,
  },
  viewType: "list",
  selectedMarina: null,
};

// Discovery slice
const discoverySlice = createSlice({
  name: "discovery",
  initialState,
  reducers: {
    // Action to update search parameters
    updateSearchParams: (
      state,
      action: PayloadAction<Partial<MarinaSearchParams>>,
    ) => {
      state.searchParams = {
        ...state.searchParams,
        ...action.payload,
        offset: 0, // Reset offset when search params change
      };
    },

    // Action to clear search results
    clearSearchResults: (state) => {
      state.marinas = [];
      state.pagination = initialState.pagination;
      state.searchParams = initialState.searchParams;
    },

    // Action to set view type
    setViewType: (state, action: PayloadAction<"list" | "map">) => {
      state.viewType = action.payload;
    },

    // Action to select a marina
    setSelectedMarina: (state, action: PayloadAction<Marina | null>) => {
      state.selectedMarina = action.payload;
    },

    // Clear errors
    clearError: (
      state,
      action: PayloadAction<keyof DiscoveryState["errors"]>,
    ) => {
      state.errors[action.payload] = null;
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.errors = initialState.errors;
    },
  },
  extraReducers: (builder) => {
    // Fetch marinas
    builder
      .addCase(fetchMarinas.pending, (state) => {
        state.loading.marinas = true;
        state.errors.marinas = null;
      })
      .addCase(fetchMarinas.fulfilled, (state, action) => {
        state.loading.marinas = false;
        state.marinas = action.payload.marinas;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMarinas.rejected, (state, action) => {
        state.loading.marinas = false;
        state.errors.marinas =
          action.error.message || "Failed to fetch marinas";
      });

    // Fetch marina filters
    builder
      .addCase(fetchMarinaFilters.pending, (state) => {
        state.loading.filters = true;
        state.errors.filters = null;
      })
      .addCase(fetchMarinaFilters.fulfilled, (state, action) => {
        state.loading.filters = false;
        state.filters = action.payload;
      })
      .addCase(fetchMarinaFilters.rejected, (state, action) => {
        state.loading.filters = false;
        state.errors.filters =
          action.error.message || "Failed to fetch filters";
      });

    // Search marinas
    builder
      .addCase(searchMarinas.pending, (state) => {
        state.loading.search = true;
        state.errors.search = null;
      })
      .addCase(searchMarinas.fulfilled, (state, action) => {
        state.loading.search = false;
        state.marinas = action.payload.marinas;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchMarinas.rejected, (state, action) => {
        state.loading.search = false;
        state.errors.search = action.error.message || "Search failed";
      });

    // Load more marinas
    builder
      .addCase(loadMoreMarinas.pending, (state) => {
        state.loading.loadMore = true;
        state.errors.loadMore = null;
      })
      .addCase(loadMoreMarinas.fulfilled, (state, action) => {
        state.loading.loadMore = false;
        state.marinas = [...state.marinas, ...action.payload.marinas];
        state.pagination = action.payload.pagination;
      })
      .addCase(loadMoreMarinas.rejected, (state, action) => {
        state.loading.loadMore = false;
        state.errors.loadMore =
          action.error.message || "Failed to load more marinas";
      });

    // Popular destinations
    builder
      .addCase(fetchPopularDestinations.pending, (state) => {
        state.loading.popularDestinations = true;
        state.errors.popularDestinations = null;
      })
      .addCase(fetchPopularDestinations.fulfilled, (state, action) => {
        state.loading.popularDestinations = false;
        state.popularDestinations = action.payload;
      })
      .addCase(fetchPopularDestinations.rejected, (state, action) => {
        state.loading.popularDestinations = false;
        state.errors.popularDestinations =
          action.error.message || "Failed to fetch popular destinations";
      });
  },
});

// Export actions
export const {
  updateSearchParams,
  clearSearchResults,
  setViewType,
  setSelectedMarina,
  clearError,
  clearAllErrors,
} = discoverySlice.actions;

// Export reducer
export default discoverySlice.reducer;
