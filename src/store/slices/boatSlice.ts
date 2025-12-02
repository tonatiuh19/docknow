import { StateCreator } from "zustand";

export interface Boat {
  id: number;
  name: string;
  model: string | null;
  manufacturer: string | null;
  year: number | null;
  length_meters: number;
  width_meters: number | null;
  draft_meters: number | null;
  home_marina: string | null;
  registration_number: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  boat_type_id: number | null;
  boat_type_name: string | null;
  boat_type_slug: string | null;
}

export interface BoatType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export interface BoatSlice {
  boats: Boat[];
  boatsLoading: "idle" | "loading" | "succeeded" | "failed";
  selectedBoat: Boat | null;
  boatTypes: BoatType[];
  boatTypesLoading: "idle" | "loading" | "succeeded" | "failed";

  // Actions
  fetchBoats: (userId: number) => Promise<void>;
  fetchBoatTypes: () => Promise<void>;
  createBoat: (boatData: Partial<Boat>) => Promise<Boat | null>;
  updateBoat: (id: number, boatData: Partial<Boat>) => Promise<Boat | null>;
  deleteBoat: (id: number) => Promise<boolean>;
  setSelectedBoat: (boat: Boat | null) => void;
}

export const createBoatSlice: StateCreator<BoatSlice> = (set, get) => ({
  boats: [],
  boatsLoading: "idle",
  selectedBoat: null,
  boatTypes: [],
  boatTypesLoading: "idle",

  fetchBoats: async (userId: number) => {
    set({ boatsLoading: "loading" });
    try {
      const response = await fetch(`/api/boats?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        set({ boats: data.data, boatsLoading: "succeeded" });
      } else {
        set({ boatsLoading: "failed" });
        console.error("Failed to fetch boats:", data.error);
      }
    } catch (error) {
      set({ boatsLoading: "failed" });
      console.error("Error fetching boats:", error);
    }
  },

  fetchBoatTypes: async () => {
    set({ boatTypesLoading: "loading" });
    try {
      const response = await fetch("/api/boats/types");
      const data = await response.json();

      if (data.success) {
        set({ boatTypes: data.data, boatTypesLoading: "succeeded" });
      } else {
        set({ boatTypesLoading: "failed" });
        console.error("Failed to fetch boat types:", data.error);
      }
    } catch (error) {
      set({ boatTypesLoading: "failed" });
      console.error("Error fetching boat types:", error);
    }
  },

  createBoat: async (boatData: Partial<Boat>) => {
    try {
      const response = await fetch("/api/boats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: boatData.id, // This should be the user ID
          name: boatData.name,
          model: boatData.model,
          manufacturer: boatData.manufacturer,
          boatTypeId: boatData.boat_type_id,
          year: boatData.year,
          lengthMeters: boatData.length_meters,
          widthMeters: boatData.width_meters,
          draftMeters: boatData.draft_meters,
          homeMarina: boatData.home_marina,
          registrationNumber: boatData.registration_number,
          insuranceProvider: boatData.insurance_provider,
          insurancePolicyNumber: boatData.insurance_policy_number,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update boats list
        set((state) => ({ boats: [data.data, ...state.boats] }));
        return data.data;
      } else {
        console.error("Failed to create boat:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error creating boat:", error);
      return null;
    }
  },

  updateBoat: async (id: number, boatData: Partial<Boat>) => {
    try {
      const response = await fetch(`/api/boats/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: boatData.name,
          model: boatData.model,
          manufacturer: boatData.manufacturer,
          boatTypeId: boatData.boat_type_id,
          year: boatData.year,
          lengthMeters: boatData.length_meters,
          widthMeters: boatData.width_meters,
          draftMeters: boatData.draft_meters,
          homeMarina: boatData.home_marina,
          registrationNumber: boatData.registration_number,
          insuranceProvider: boatData.insurance_provider,
          insurancePolicyNumber: boatData.insurance_policy_number,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update boats list
        set((state) => ({
          boats: state.boats.map((boat) => (boat.id === id ? data.data : boat)),
        }));
        return data.data;
      } else {
        console.error("Failed to update boat:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error updating boat:", error);
      return null;
    }
  },

  deleteBoat: async (id: number) => {
    try {
      const response = await fetch(`/api/boats/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Remove boat from list
        set((state) => ({
          boats: state.boats.filter((boat) => boat.id !== id),
        }));
        return true;
      } else {
        console.error("Failed to delete boat:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting boat:", error);
      return false;
    }
  },

  setSelectedBoat: (boat: Boat | null) => {
    set({ selectedBoat: boat });
  },
});
