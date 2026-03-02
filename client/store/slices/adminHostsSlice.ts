import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Types
export interface Host {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  marina_count?: number;
}

export interface AssignedHost {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  marina_id: number;
  role: "primary" | "manager" | "staff";
  is_active: boolean;
  assigned_at: string;
}

export interface CreateHostData {
  email: string;
  fullName: string;
  phone?: string;
  phoneCode?: string;
  countryCode?: string;
  marinaId?: number | null;
  role?: "primary" | "manager" | "staff";
}

export interface AssignHostData {
  marinaId: number;
  hostId: number;
  role?: "primary" | "manager" | "staff";
}

export interface UpdateHostRoleData {
  hostId: number;
  role: "primary" | "manager" | "staff";
}

export interface RemoveHostData {
  hostId: number;
}

interface AdminHostsState {
  assignedHosts: AssignedHost[];
  availableHosts: Host[];
  marinaId: number | null;
  loading: boolean;
  creating: boolean;
  assigning: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: AdminHostsState = {
  assignedHosts: [],
  availableHosts: [],
  marinaId: null,
  loading: false,
  creating: false,
  assigning: false,
  updating: false,
  error: null,
};

// Async thunks
export const fetchManagedHosts = createAsyncThunk(
  "adminHosts/fetchManagedHosts",
  async (marinaId: number | undefined, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as any;
      const url = marinaId
        ? `/api/admin/hosts?marinaId=${marinaId}`
        : "/api/admin/hosts";

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${hostAuth.sessionToken}` },
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch hosts");
      }

      return {
        assignedHosts: data.assignedHosts || [],
        availableHosts: data.availableHosts || [],
        marinaId: data.marinaId,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const createHost = createAsyncThunk(
  "adminHosts/createHost",
  async (hostData: CreateHostData, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as any;
      const { data } = await axios.post("/api/admin/hosts", hostData, {
        headers: { Authorization: `Bearer ${hostAuth.sessionToken}` },
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to create host");
      }

      return data.host;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const assignHost = createAsyncThunk(
  "adminHosts/assignHost",
  async (assignData: AssignHostData, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as any;
      const { data } = await axios.post("/api/admin/hosts/assign", assignData, {
        headers: { Authorization: `Bearer ${hostAuth.sessionToken}` },
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to assign host");
      }

      return data.assignment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const updateHostRole = createAsyncThunk(
  "adminHosts/updateHostRole",
  async (updateData: UpdateHostRoleData, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as any;
      const { data } = await axios.put(
        `/api/admin/hosts/${updateData.hostId}/role`,
        { role: updateData.role },
        {
          headers: { Authorization: `Bearer ${hostAuth.sessionToken}` },
        },
      );

      if (!data.success) {
        throw new Error(data.error || "Failed to update host role");
      }

      return { hostId: updateData.hostId, role: updateData.role };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

export const removeHost = createAsyncThunk(
  "adminHosts/removeHost",
  async (removeData: RemoveHostData, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as any;
      const { data } = await axios.delete(
        `/api/admin/hosts/${removeData.hostId}`,
        {
          headers: { Authorization: `Bearer ${hostAuth.sessionToken}` },
        },
      );

      if (!data.success) {
        throw new Error(data.error || "Failed to remove host");
      }

      return removeData.hostId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  },
);

// Slice
const adminHostsSlice = createSlice({
  name: "adminHosts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMarinaId: (state, action) => {
      state.marinaId = action.payload;
    },
    resetHosts: (state) => {
      state.assignedHosts = [];
      state.availableHosts = [];
      state.marinaId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch hosts
      .addCase(fetchManagedHosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagedHosts.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedHosts = action.payload.assignedHosts;
        state.availableHosts = action.payload.availableHosts;
        state.marinaId = action.payload.marinaId;
        state.error = null;
      })
      .addCase(fetchManagedHosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create host
      .addCase(createHost.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createHost.fulfilled, (state, action) => {
        state.creating = false;
        state.availableHosts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createHost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })

      // Assign host
      .addCase(assignHost.pending, (state) => {
        state.assigning = true;
        state.error = null;
      })
      .addCase(assignHost.fulfilled, (state, action) => {
        state.assigning = false;
        // Remove from available hosts
        const hostId = action.payload.hostId;
        state.availableHosts = state.availableHosts.filter(
          (h) => h.id !== hostId,
        );
        state.error = null;
      })
      .addCase(assignHost.rejected, (state, action) => {
        state.assigning = false;
        state.error = action.payload as string;
      })

      // Update host role
      .addCase(updateHostRole.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateHostRole.fulfilled, (state, action) => {
        state.updating = false;
        // Refresh will be handled by parent component
        state.error = null;
      })
      .addCase(updateHostRole.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })

      // Remove host
      .addCase(removeHost.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(removeHost.fulfilled, (state, action) => {
        state.updating = false;
        const hostId = action.payload;
        const hostIndex = state.assignedHosts.findIndex((h) => h.id === hostId);
        if (hostIndex !== -1) {
          // Move back to available hosts
          const host = state.assignedHosts[hostIndex];
          state.availableHosts.unshift({
            id: host.id,
            full_name: host.full_name,
            email: host.email,
            phone: host.phone,
            created_at: host.assigned_at,
            marina_count: 0,
          });
          // Remove from assigned hosts
          state.assignedHosts = state.assignedHosts.filter(
            (h) => h.id !== hostId,
          );
        }
        state.error = null;
      })
      .addCase(removeHost.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setMarinaId, resetHosts } = adminHostsSlice.actions;
export default adminHostsSlice.reducer;
