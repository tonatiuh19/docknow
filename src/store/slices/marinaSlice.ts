import { StateCreator } from "zustand";
import axios from "axios";
import { LoadingState } from "../types";
import {
  Marina,
  ApiMarinasSearchResponse,
  transformApiMarina,
} from "../../models/marina";

// Filter Options Types
export interface AmenityType {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface BusinessType {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface LocationOption {
  city: string;
  state: string;
  country: string;
  label: string;
}

export interface FilterOptions {
  amenityTypes: AmenityType[];
  businessTypes: BusinessType[];
  locations: LocationOption[];
  priceRange: {
    min: number;
    max: number;
  };
}

// Marina State
export interface MarinaState {
  marinas: Marina[];
  selectedMarina: Marina | null;
  marinasLoading: LoadingState;
  filterOptions: FilterOptions | null;
  filterOptionsLoading: LoadingState;
  marinaFilters: {
    search: string;
    city: string | null;
    state: string | null;
    checkIn: string | null;
    checkOut: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minBoatLength: number | null;
    maxBoatLength: number | null;
    minDraft: number | null;
    featured: boolean | null;
    amenityIds: number[];
    businessTypeId: number | null;
  };
  marinaPagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Marina Actions
export interface MarinaActions {
  fetchMarinas: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  fetchMarinaById: (id: number) => Promise<void>;
  createMarina: (data: Partial<Marina>) => Promise<void>;
  updateMarina: (id: number, data: Partial<Marina>) => Promise<void>;
  deleteMarina: (id: number) => Promise<void>;
  toggleMarinaStatus: (id: number) => Promise<void>;
  setSelectedMarina: (marina: Marina | null) => void;
  setMarinaFilters: (filters: Partial<MarinaState["marinaFilters"]>) => void;
  setMarinaPage: (page: number) => void;
}

// Marina Slice Type
export type MarinaSlice = MarinaState & MarinaActions;

// Initial State
const initialMarinaState: MarinaState = {
  marinas: [],
  selectedMarina: null,
  marinasLoading: "idle",
  filterOptions: null,
  filterOptionsLoading: "idle",
  marinaFilters: {
    search: "",
    city: null,
    state: null,
    checkIn: null,
    checkOut: null,
    minPrice: null,
    maxPrice: null,
    minBoatLength: null,
    maxBoatLength: null,
    minDraft: null,
    featured: null,
    amenityIds: [],
    businessTypeId: null,
  },
  marinaPagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
};

// Create Marina Slice
export const createMarinaSlice: StateCreator<
  MarinaSlice,
  [["zustand/immer", never]],
  [],
  MarinaSlice
> = (set, get) => ({
  ...initialMarinaState,

  fetchMarinas: async () => {
    set((state) => {
      state.marinasLoading = "loading";
    });
    try {
      const { marinaFilters, marinaPagination } = get();

      // Calculate offset from page
      const offset = (marinaPagination.page - 1) * marinaPagination.limit;

      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: marinaPagination.limit.toString(),
        ...(marinaFilters.search && { searchTerm: marinaFilters.search }),
        ...(marinaFilters.city && { city: marinaFilters.city }),
        ...(marinaFilters.state && { state: marinaFilters.state }),
        ...(marinaFilters.checkIn && { checkIn: marinaFilters.checkIn }),
        ...(marinaFilters.checkOut && { checkOut: marinaFilters.checkOut }),
        ...(marinaFilters.minPrice && {
          minPrice: marinaFilters.minPrice.toString(),
        }),
        ...(marinaFilters.maxPrice && {
          maxPrice: marinaFilters.maxPrice.toString(),
        }),
        ...(marinaFilters.minBoatLength && {
          minBoatLength: marinaFilters.minBoatLength.toString(),
        }),
        ...(marinaFilters.maxBoatLength && {
          maxBoatLength: marinaFilters.maxBoatLength.toString(),
        }),
        ...(marinaFilters.minDraft && {
          minDraft: marinaFilters.minDraft.toString(),
        }),
        ...(marinaFilters.featured !== null && {
          featured: marinaFilters.featured.toString(),
        }),
        ...(marinaFilters.amenityIds.length > 0 && {
          amenities: marinaFilters.amenityIds.join(","),
        }),
        ...(marinaFilters.businessTypeId && {
          businessTypeId: marinaFilters.businessTypeId.toString(),
        }),
      });

      const token = localStorage.getItem("auth_token");
      const response = await axios.get<ApiMarinasSearchResponse>(
        `/api/marinas/search?${params}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const apiData = response.data;

      // Use typed API response and transform function
      const marinasData = apiData.data.marinas;
      const pagination = apiData.data.pagination;

      // Transform API response to internal Marina type
      const transformedMarinas = marinasData.map(transformApiMarina);

      set((state) => {
        state.marinas = transformedMarinas;
        state.marinaPagination.total = pagination.total;
        state.marinaPagination.limit = pagination.limit;
        state.marinaPagination.hasMore = pagination.hasMore;
        state.marinasLoading = "succeeded";
      });
    } catch (error) {
      set((state) => {
        state.marinasLoading = "failed";
        state.marinas = [];
      });
      console.error("Failed to fetch marinas:", error);
    }
  },

  fetchFilterOptions: async () => {
    set((state) => {
      state.filterOptionsLoading = "loading";
    });
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get("/api/marinas/filters", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = response.data;

      set((state) => {
        state.filterOptions = {
          amenityTypes: data.data?.amenityTypes || [],
          businessTypes: data.data?.businessTypes || [],
          locations: data.data?.locations || [],
          priceRange: data.data?.priceRange || { min: 0, max: 10000 },
        };
        state.filterOptionsLoading = "succeeded";
      });
    } catch (error) {
      set((state) => {
        state.filterOptionsLoading = "failed";
      });
      console.error("Failed to fetch filter options:", error);
    }
  },

  fetchMarinaById: async (id: number) => {
    set((state) => {
      state.marinasLoading = "loading";
    });
    try {
      const response = await axios.get(`/api/marinas/${id}`);
      const data = response.data;

      set((state) => {
        state.selectedMarina = data.marina || data.data;
        state.marinasLoading = "succeeded";
      });
    } catch (error) {
      set((state) => {
        state.marinasLoading = "failed";
      });
      throw error;
    }
  },

  createMarina: async (data: Partial<Marina>) => {
    set((state) => {
      state.marinasLoading = "loading";
    });
    try {
      const response = await axios.post("/api/marinas", data);
      const newMarina = response.data.marina || response.data.data;

      set((state) => {
        state.marinas.unshift(newMarina);
        state.marinasLoading = "succeeded";
      });

      await get().fetchMarinas();
    } catch (error) {
      set((state) => {
        state.marinasLoading = "failed";
      });
      throw error;
    }
  },

  updateMarina: async (id: number, data: Partial<Marina>) => {
    set((state) => {
      state.marinasLoading = "loading";
    });
    try {
      const response = await axios.put(`/api/marinas/${id}`, data);
      const updatedMarina = response.data.marina || response.data.data;

      set((state) => {
        const index = state.marinas.findIndex((m) => m.id === id);
        if (index !== -1) {
          state.marinas[index] = updatedMarina;
        }
        if (state.selectedMarina?.id === id) {
          state.selectedMarina = updatedMarina;
        }
        state.marinasLoading = "succeeded";
      });

      await get().fetchMarinas();
    } catch (error) {
      set((state) => {
        state.marinasLoading = "failed";
      });
      throw error;
    }
  },

  deleteMarina: async (id: number) => {
    set((state) => {
      state.marinasLoading = "loading";
    });
    try {
      await axios.delete(`/api/marinas/${id}`);

      set((state) => {
        state.marinas = state.marinas.filter((m) => m.id !== id);
        if (state.selectedMarina?.id === id) {
          state.selectedMarina = null;
        }
        state.marinasLoading = "succeeded";
      });

      await get().fetchMarinas();
    } catch (error) {
      set((state) => {
        state.marinasLoading = "failed";
      });
      throw error;
    }
  },

  toggleMarinaStatus: async (id: number) => {
    try {
      const response = await axios.patch(`/api/marinas/${id}/toggle-status`);
      const updatedMarina = response.data.marina || response.data.data;

      set((state) => {
        const index = state.marinas.findIndex((m) => m.id === id);
        if (index !== -1) {
          state.marinas[index] = updatedMarina;
        }
        if (state.selectedMarina?.id === id) {
          state.selectedMarina = updatedMarina;
        }
      });

      await get().fetchMarinas();
    } catch (error) {
      throw error;
    }
  },

  setSelectedMarina: (marina: Marina | null) => {
    set((state) => {
      state.selectedMarina = marina;
    });
  },

  setMarinaFilters: (filters: Partial<MarinaState["marinaFilters"]>) => {
    set((state) => {
      state.marinaFilters = { ...state.marinaFilters, ...filters };
    });
  },

  setMarinaPage: (page: number) => {
    set((state) => {
      state.marinaPagination.page = page;
    });
  },
});
