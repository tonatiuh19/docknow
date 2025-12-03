import { StateCreator } from "zustand";
import axios from "axios";
import { LoadingState } from "../types";

// Host Interface
export interface Host {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  phone_code?: string;
  country_code?: string;
  profile_image_url?: string;
  company_name?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Host State
export interface HostAuthState {
  host: Host | null;
  hostToken: string | null;
  hostIsAuthenticated: boolean;
  hostAuthLoading: LoadingState;
}

// Host Actions
export interface HostAuthActions {
  hostLogin: (email: string, code: string) => Promise<void>;
  hostLogout: () => void;
  setHost: (host: Host) => void;
  setHostToken: (token: string) => void;
  checkHostAuth: () => Promise<void>;
  sendHostCode: (email: string) => Promise<void>;
}

// Host Slice Type
export type HostAuthSlice = HostAuthState & HostAuthActions;

// Initial State
const initialHostAuthState: HostAuthState = {
  host: null,
  hostToken: null,
  hostIsAuthenticated: false,
  hostAuthLoading: "idle",
};

// Create Host Auth Slice
export const createHostAuthSlice: StateCreator<
  HostAuthSlice,
  [["zustand/immer", never]],
  [],
  HostAuthSlice
> = (set) => ({
  ...initialHostAuthState,

  sendHostCode: async (email: string) => {
    set((state) => {
      state.hostAuthLoading = "loading";
    });
    try {
      await axios.post("/api/host/send-code", { email });
      set((state) => {
        state.hostAuthLoading = "succeeded";
      });
    } catch (error) {
      set((state) => {
        state.hostAuthLoading = "failed";
      });
      throw error;
    }
  },

  hostLogin: async (email: string, code: string) => {
    set((state) => {
      state.hostAuthLoading = "loading";
    });
    try {
      const response = await axios.post("/api/host/verify-code", {
        email,
        code,
      });

      const data = response.data;
      localStorage.setItem("host_auth_token", data.token);

      set((state) => {
        state.host = data.host;
        state.hostToken = data.token;
        state.hostIsAuthenticated = true;
        state.hostAuthLoading = "succeeded";
      });
    } catch (error) {
      set((state) => {
        state.hostAuthLoading = "failed";
      });
      throw error;
    }
  },

  hostLogout: () => {
    localStorage.removeItem("host_auth_token");
    set((state) => {
      state.host = null;
      state.hostToken = null;
      state.hostIsAuthenticated = false;
    });
  },

  setHost: (host: Host) => {
    set((state) => {
      state.host = host;
      state.hostIsAuthenticated = true;
    });
  },

  setHostToken: (token: string) => {
    localStorage.setItem("host_auth_token", token);
    set((state) => {
      state.hostToken = token;
      state.hostIsAuthenticated = true;
    });
  },

  checkHostAuth: async () => {
    const token = localStorage.getItem("host_auth_token");
    if (!token) {
      set((state) => {
        state.hostAuthLoading = "succeeded";
      });
      return;
    }

    set((state) => {
      state.hostAuthLoading = "loading";
      state.hostToken = token;
    });

    try {
      const response = await axios.get("/api/host/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      set((state) => {
        state.host = data.host;
        state.hostIsAuthenticated = true;
        state.hostAuthLoading = "succeeded";
      });
    } catch (error) {
      localStorage.removeItem("host_auth_token");
      set((state) => {
        state.host = null;
        state.hostToken = null;
        state.hostIsAuthenticated = false;
        state.hostAuthLoading = "succeeded";
      });
    }
  },
});
