import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Host {
  id: number;
  email: string;
  full_name: string;
  company_name?: string;
  profile_image_url?: string;
}

interface HostAuthState {
  host: Host | null;
  isAuthenticated: boolean;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: HostAuthState = {
  host: null,
  isAuthenticated: false,
  sessionToken:
    typeof window !== "undefined"
      ? localStorage.getItem("host_session_token")
      : null,
  isLoading: false,
  error: null,
};

// Send verification code to host email
export const sendHostCode = createAsyncThunk(
  "hostAuth/sendCode",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/host/send-code", { email });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to send verification code",
      );
    }
  },
);

// Verify code and login host
export const verifyHostCode = createAsyncThunk(
  "hostAuth/verifyCode",
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post("/api/host/verify-code", {
        email,
        code,
      });

      if (data.token) {
        localStorage.setItem("host_session_token", data.token);
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to verify code",
      );
    }
  },
);

// Check host authentication status
export const checkHostAuth = createAsyncThunk(
  "hostAuth/checkAuth",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { hostAuth } = getState() as { hostAuth: HostAuthState };
      const token = hostAuth.sessionToken;

      if (!token) {
        return rejectWithValue("No authentication token");
      }

      const { data } = await axios.get("/api/host/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data;
    } catch (error: any) {
      localStorage.removeItem("host_session_token");
      return rejectWithValue(
        error.response?.data?.error || "Authentication failed",
      );
    }
  },
);

// Logout host
export const logoutHost = createAsyncThunk("hostAuth/logout", async () => {
  localStorage.removeItem("host_session_token");
  return null;
});

const hostAuthSlice = createSlice({
  name: "hostAuth",
  initialState,
  reducers: {
    clearHostError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send host code
      .addCase(sendHostCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendHostCode.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendHostCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify host code
      .addCase(verifyHostCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyHostCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.host = action.payload.host;
        state.sessionToken = action.payload.token;
        state.error = null;
      })
      .addCase(verifyHostCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check host auth
      .addCase(checkHostAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkHostAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.host = action.payload.host;
        state.error = null;
      })
      .addCase(checkHostAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.host = null;
        state.sessionToken = null;
        state.error = action.payload as string;
      })
      // Logout host
      .addCase(logoutHost.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.host = null;
        state.sessionToken = null;
        state.error = null;
      });
  },
});

export const { clearHostError } = hostAuthSlice.actions;
export default hostAuthSlice.reducer;
