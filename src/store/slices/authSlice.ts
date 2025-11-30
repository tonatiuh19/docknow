import { StateCreator } from "zustand";
import axios from "axios";
import { User, LoadingState } from "../types";

// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: LoadingState;
}

// Auth Actions
export interface AuthActions {
  login: (email: string, code: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

// Auth Slice Type
export type AuthSlice = AuthState & AuthActions;

// Initial State
const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  authLoading: "idle",
};

// Create Auth Slice with proper typing
export const createAuthSlice: StateCreator<
  AuthSlice,
  [["zustand/immer", never]],
  [],
  AuthSlice
> = (set) => ({
  ...initialAuthState,

  login: async (email: string, code: string) => {
    set((state) => {
      state.authLoading = "loading";
    });
    try {
      const response = await axios.post("/api/auth/verify-code", {
        email,
        code,
      });

      const data = response.data;
      localStorage.setItem("auth_token", data.token);

      set((state) => {
        state.user = data.user;
        state.token = data.token;
        state.isAuthenticated = true;
        state.authLoading = "succeeded";
      });
    } catch (error) {
      set((state) => {
        state.authLoading = "failed";
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    set((state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },

  setUser: (user: User) => {
    set((state) => {
      state.user = user;
      state.isAuthenticated = true;
    });
  },

  setToken: (token: string) => {
    localStorage.setItem("auth_token", token);
    set((state) => {
      state.token = token;
      state.isAuthenticated = true;
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      set((state) => {
        state.authLoading = "succeeded";
      });
      return;
    }

    set((state) => {
      state.authLoading = "loading";
      state.token = token;
    });

    try {
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      set((state) => {
        state.user = data.user;
        state.isAuthenticated = true;
        state.authLoading = "succeeded";
      });
    } catch (error) {
      localStorage.removeItem("auth_token");
      set((state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.authLoading = "succeeded";
      });
    }
  },
});
