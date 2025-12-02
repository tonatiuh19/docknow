import { StateCreator } from "zustand";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  date_of_birth: string | null;
  phone: string | null;
  phone_code: string | null;
  country_code: string | null;
  profile_image_url: string | null;
  user_type: "guest" | "host" | "admin";
  email_verified: boolean;
  general_notifications: boolean;
  marketing_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProfileActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => void;
}

export type ProfileSlice = ProfileState & ProfileActions;

export const createProfileSlice: StateCreator<ProfileSlice> = (set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      set({ profile: data.data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      set({ profile: result.data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  clearProfile: () => {
    set({
      profile: null,
      isLoading: false,
      error: null,
    });
  },
});
