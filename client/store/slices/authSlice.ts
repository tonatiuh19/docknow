import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const apiBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  user_type: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  userId: number | null;
  userExists: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  userId: null,
  userExists: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Check if user exists
export const checkGuest = createAsyncThunk(
  "auth/checkGuest",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${apiBaseURL}/api/auth/check-guest`, {
        email,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to check user",
      );
    }
  },
);

// Send verification code
export const sendGuestCode = createAsyncThunk(
  "auth/sendGuestCode",
  async (
    { userId, email }: { userId: number; email: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post(
        `${apiBaseURL}/api/auth/send-guest-code`,
        {
          userId,
          email,
        },
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to send code",
      );
    }
  },
);

// Register new guest
export const registerGuest = createAsyncThunk(
  "auth/registerGuest",
  async (
    {
      email,
      fullName,
      phone,
      phoneCode,
      countryCode,
      dateOfBirth,
    }: {
      email: string;
      fullName: string;
      phone?: string;
      phoneCode?: string;
      countryCode?: string;
      dateOfBirth?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post(
        `${apiBaseURL}/api/auth/register-guest`,
        {
          email,
          fullName,
          phone,
          phoneCode,
          countryCode,
          dateOfBirth,
        },
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to register",
      );
    }
  },
);

// Verify code
export const verifyGuestCode = createAsyncThunk(
  "auth/verifyGuestCode",
  async (
    { userId, code }: { userId: number; code: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.post(
        `${apiBaseURL}/api/auth/verify-guest-code`,
        {
          userId,
          code,
        },
      );

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Invalid code");
    }
  },
);

// Check current auth status
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return { user: null };
      }

      const { data } = await axios.get(`${apiBaseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error: any) {
      localStorage.removeItem("authToken");
      return rejectWithValue(
        error.response?.data?.error || "Not authenticated",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("authToken");
    },
    clearError: (state) => {
      state.error = null;
    },
    setUserId: (state, action: PayloadAction<number>) => {
      state.userId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Check guest
    builder.addCase(checkGuest.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkGuest.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userExists = action.payload.exists;
      if (action.payload.userId) {
        state.userId = action.payload.userId;
      }
    });
    builder.addCase(checkGuest.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Send guest code
    builder.addCase(sendGuestCode.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendGuestCode.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(sendGuestCode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register guest
    builder.addCase(registerGuest.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerGuest.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userId = action.payload.userId;
    });
    builder.addCase(registerGuest.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify guest code
    builder.addCase(verifyGuestCode.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyGuestCode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(verifyGuestCode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Check auth status
    builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
      if (action.payload.user) {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.token = localStorage.getItem("authToken");
      }
    });
    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    });
  },
});

export const { logout, clearError, setUserId } = authSlice.actions;
export default authSlice.reducer;
