import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  ConfirmBookingRequest,
  BookingServiceType,
  SavedPaymentMethod,
} from "@shared/api";

const apiBaseURL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

interface UserBoat {
  id: number;
  boat_name: string;
  boat_type: string;
  boat_type_id?: number;
  manufacturer?: string;
  model?: string;
  year?: number;
  length_meters: number;
  width_meters: number;
  draft_meters: number;
  home_marina?: string;
  registration_number?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  photo_url?: string | null;
}

interface BoatType {
  id: number;
  name: string;
  description?: string;
}

interface PreCheckoutField {
  id: number;
  field_label: string;
  field_type: "text" | "textarea" | "file" | "multiple_files" | "select";
  is_required: boolean;
  options?: string[];
  validation_rules?: string | null;
  file_types_allowed?: string; // CSV of allowed extensions like "pdf,jpg,png"
  max_file_size_mb?: number;
  max_files?: number;
}

interface UploadedFile {
  filename: string;
  path: string;
  original_name: string;
  size?: number;
  upload_id: string; // Unique identifier for the upload
}

interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  files: UploadedFile[];
}

interface PreCheckoutStep {
  id: number;
  step_name: string;
  title: string;
  description?: string;
  is_required: boolean;
  display_order: number;
  fields?: PreCheckoutField[];
}

interface BookingState {
  boats: UserBoat[];
  boatTypes: BoatType[];
  preCheckoutSteps: PreCheckoutStep[];
  selectedBoat: UserBoat | null;
  preCheckoutResponses: Record<number, string | UploadedFile[]>;
  // File upload state per field
  fileUploads: Record<number, FileUploadState>;
  // Payment-related state
  paymentClientSecret: string | null;
  setupIntentClientSecret: string | null;
  paymentMethods: SavedPaymentMethod[];
  defaultPaymentMethodId: string | null;
  bookingId: number | null;
  paymentStatus: "idle" | "processing" | "succeeded" | "failed";
  paymentError: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  boats: [],
  boatTypes: [],
  preCheckoutSteps: [],
  selectedBoat: null,
  preCheckoutResponses: {},
  fileUploads: {},
  paymentClientSecret: null,
  setupIntentClientSecret: null,
  paymentMethods: [],
  defaultPaymentMethodId: null,
  bookingId: null,
  paymentStatus: "idle",
  paymentError: null,
  isLoading: false,
  error: null,
};

// Fetch user boats
export const fetchUserBoats = createAsyncThunk(
  "booking/fetchUserBoats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(`${apiBaseURL}/api/boats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.boats || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load boats",
      );
    }
  },
);

// Fetch boat types
export const fetchBoatTypes = createAsyncThunk(
  "booking/fetchBoatTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${apiBaseURL}/api/boats/types`);
      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load boat types",
      );
    }
  },
);

// Create new boat
export const createBoat = createAsyncThunk(
  "booking/createBoat",
  async (
    boatData: {
      boat_name: string;
      boat_type_id?: number;
      manufacturer?: string;
      model?: string;
      year?: number;
      length_meters: number;
      width_meters: number;
      draft_meters: number;
      home_marina?: string;
      registration_number?: string;
      insurance_provider?: string;
      insurance_policy_number?: string;
      photo_url?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(`${apiBaseURL}/api/boats`, boatData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.boat;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create boat",
      );
    }
  },
);

// Fetch pre-checkout steps for marina
export const fetchPreCheckoutSteps = createAsyncThunk(
  "booking/fetchPreCheckoutSteps",
  async (marinaId: number, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${apiBaseURL}/api/bookings/pre-checkout-steps?marinaId=${marinaId}`,
      );
      return data.steps || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to load pre-checkout steps",
      );
    }
  },
);

// Upload file for pre-checkout step
export const uploadPreCheckoutFile = createAsyncThunk(
  "booking/uploadFile",
  async (
    {
      fieldId,
      file,
      field,
    }: {
      fieldId: number;
      file: File;
      field: PreCheckoutField;
    },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();

      // Determine if it's a PDF or image based on file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedTypes =
        field.file_types_allowed?.toLowerCase().split(",") || [];

      // Validate file type
      if (!allowedTypes.includes(fileExtension || "")) {
        throw new Error(
          `File type .${fileExtension} is not allowed. Allowed types: ${field.file_types_allowed}`,
        );
      }

      // Validate file size (convert MB to bytes)
      const maxSizeBytes = (field.max_file_size_mb || 10) * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(
          `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${field.max_file_size_mb || 10}MB)`,
        );
      }

      let uploadUrl: string;

      if (["pdf", "doc", "docx", "txt"].includes(fileExtension || "")) {
        // Upload PDF/documents
        uploadUrl = "https://disruptinglabs.com/data/api/uploadPDFs.php";
        formData.append("main_folder", "docknow");
        formData.append("id", `field_${fieldId}_${Date.now()}`);
        formData.append("pdfs", file);
      } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || "")) {
        // Upload images
        uploadUrl = "https://disruptinglabs.com/data/api/uploadImages.php";
        formData.append("main_folder", "docknow");
        formData.append("id", `field_${fieldId}_${Date.now()}`);

        if (field.field_type === "file") {
          formData.append("main_image", file);
        } else {
          formData.append("images[]", file);
        }
      } else {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          // Handle upload progress if needed
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          // You can dispatch a progress action here if needed
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Upload failed");
      }

      let uploadedFile: UploadedFile;

      if (response.data.uploaded && response.data.uploaded.length > 0) {
        // PDF upload response
        const uploaded = response.data.uploaded[0];
        uploadedFile = {
          filename: uploaded.filename,
          path: uploaded.path,
          original_name: uploaded.original_name,
          size: uploaded.size,
          upload_id: `${fieldId}_${Date.now()}`,
        };
      } else if (response.data.main_image) {
        // Image upload response (main image)
        uploadedFile = {
          filename: response.data.main_image.filename,
          path: response.data.main_image.path,
          original_name: response.data.main_image.original_name,
          upload_id: `${fieldId}_${Date.now()}`,
        };
      } else if (
        response.data.extra_images &&
        response.data.extra_images.length > 0
      ) {
        // Image upload response (extra images)
        const uploaded = response.data.extra_images[0];
        uploadedFile = {
          filename: uploaded.filename,
          path: uploaded.path,
          original_name: uploaded.original_name,
          upload_id: `${fieldId}_${Date.now()}`,
        };
      } else {
        throw new Error("No file data returned from upload");
      }

      return {
        fieldId,
        file: uploadedFile,
      };
    } catch (error: any) {
      console.error("File upload error:", error);
      return rejectWithValue(
        error.message || error.response?.data?.error || "Failed to upload file",
      );
    }
  },
);

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  "booking/createPaymentIntent",
  async (
    paymentData: {
      userId: number;
      marinaId: number;
      boatId: number;
      slipId?: number;
      paymentMethodId?: string;
      checkIn: string;
      checkOut: string;
      couponCode?: string;
      specialRequests?: string;
      serviceType?: BookingServiceType;
    },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        `${apiBaseURL}/api/bookings/create-payment-intent`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data as PaymentIntentResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create payment intent",
      );
    }
  },
);

// Fetch saved payment methods
export const fetchSavedPaymentMethods = createAsyncThunk(
  "booking/fetchSavedPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(`${apiBaseURL}/api/payments/methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        methods: (data.methods || []) as SavedPaymentMethod[],
        defaultPaymentMethodId: (data.defaultPaymentMethodId || null) as
          | string
          | null,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch payment methods",
      );
    }
  },
);

// Create setup intent for attaching new card
export const createSetupIntent = createAsyncThunk(
  "booking/createSetupIntent",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        `${apiBaseURL}/api/payments/setup-intent`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data.clientSecret as string;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create setup intent",
      );
    }
  },
);

// Confirm booking after successful payment
export const confirmBooking = createAsyncThunk(
  "booking/confirmBooking",
  async (confirmData: ConfirmBookingRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        `${apiBaseURL}/api/bookings/confirm`,
        confirmData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to confirm booking",
      );
    }
  },
);

// Create booking (deprecated - replaced by payment intent flow)
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (
    bookingData: {
      marina_id: number;
      slip_id: number;
      boat_id: number;
      check_in_date: Date;
      check_out_date: Date;
      pre_checkout_responses: Record<number, string>;
    },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        `${apiBaseURL}/api/bookings/create-payment-intent`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create booking",
      );
    }
  },
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedBoat: (state, action: PayloadAction<UserBoat | null>) => {
      state.selectedBoat = action.payload;
    },
    setPreCheckoutResponse: (
      state,
      action: PayloadAction<{
        stepId: number;
        response: string | UploadedFile[];
      }>,
    ) => {
      state.preCheckoutResponses[action.payload.stepId] =
        action.payload.response;
    },
    // Initialize file upload state for a field
    initFileUpload: (state, action: PayloadAction<{ fieldId: number }>) => {
      state.fileUploads[action.payload.fieldId] = {
        uploading: false,
        progress: 0,
        error: null,
        files: [],
      };
    },
    // Set upload progress
    setUploadProgress: (
      state,
      action: PayloadAction<{ fieldId: number; progress: number }>,
    ) => {
      if (state.fileUploads[action.payload.fieldId]) {
        state.fileUploads[action.payload.fieldId].progress =
          action.payload.progress;
      }
    },
    // Remove uploaded file
    removeUploadedFile: (
      state,
      action: PayloadAction<{ fieldId: number; uploadId: string }>,
    ) => {
      const upload = state.fileUploads[action.payload.fieldId];
      if (upload) {
        upload.files = upload.files.filter(
          (file) => file.upload_id !== action.payload.uploadId,
        );
        // Update preCheckoutResponses
        state.preCheckoutResponses[action.payload.fieldId] = upload.files;
      }
    },
    // Clear file uploads for a field
    clearFileUploads: (state, action: PayloadAction<{ fieldId: number }>) => {
      if (state.fileUploads[action.payload.fieldId]) {
        state.fileUploads[action.payload.fieldId] = {
          uploading: false,
          progress: 0,
          error: null,
          files: [],
        };
        delete state.preCheckoutResponses[action.payload.fieldId];
      }
    },
    setPaymentStatus: (
      state,
      action: PayloadAction<"idle" | "processing" | "succeeded" | "failed">,
    ) => {
      state.paymentStatus = action.payload;
      if (action.payload !== "failed") {
        state.paymentError = null;
      }
    },
    setPaymentError: (state, action: PayloadAction<string>) => {
      state.paymentError = action.payload;
      state.paymentStatus = "failed";
    },
    clearBookingState: (state) => {
      state.selectedBoat = null;
      state.preCheckoutResponses = {};
      state.fileUploads = {};
      state.paymentClientSecret = null;
      state.setupIntentClientSecret = null;
      state.paymentMethods = [];
      state.defaultPaymentMethodId = null;
      state.bookingId = null;
      state.paymentStatus = "idle";
      state.paymentError = null;
      state.error = null;
    },
    clearSetupIntentClientSecret: (state) => {
      state.setupIntentClientSecret = null;
    },
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user boats
    builder.addCase(fetchUserBoats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserBoats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.boats = action.payload;
    });
    builder.addCase(fetchUserBoats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch boat types
    builder.addCase(fetchBoatTypes.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBoatTypes.fulfilled, (state, action) => {
      state.isLoading = false;
      state.boatTypes = action.payload;
    });
    builder.addCase(fetchBoatTypes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create boat
    builder.addCase(createBoat.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBoat.fulfilled, (state, action) => {
      state.isLoading = false;
      state.boats.push(action.payload);
      state.selectedBoat = action.payload;
    });
    builder.addCase(createBoat.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch pre-checkout steps
    builder.addCase(fetchPreCheckoutSteps.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPreCheckoutSteps.fulfilled, (state, action) => {
      state.isLoading = false;
      state.preCheckoutSteps = action.payload;
    });
    builder.addCase(fetchPreCheckoutSteps.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create booking (deprecated)
    builder.addCase(createBooking.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create payment intent
    builder.addCase(createPaymentIntent.pending, (state) => {
      state.isLoading = true;
      state.paymentStatus = "processing";
      state.error = null;
      state.paymentError = null;
      // Avoid rendering stale PaymentElement from a previous attempt.
      state.paymentClientSecret = null;
      state.bookingId = null;
    });
    builder.addCase(createPaymentIntent.fulfilled, (state, action) => {
      state.isLoading = false;
      state.paymentClientSecret = action.payload.clientSecret;
      state.bookingId = action.payload.bookingId;
      state.paymentStatus = "idle";
    });
    builder.addCase(createPaymentIntent.rejected, (state, action) => {
      state.isLoading = false;
      state.paymentStatus = "failed";
      state.paymentError = action.payload as string;
    });

    // Saved payment methods
    builder.addCase(fetchSavedPaymentMethods.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSavedPaymentMethods.fulfilled, (state, action) => {
      state.isLoading = false;
      state.paymentMethods = action.payload.methods;
      state.defaultPaymentMethodId = action.payload.defaultPaymentMethodId;
    });
    builder.addCase(fetchSavedPaymentMethods.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Setup intent
    builder.addCase(createSetupIntent.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.paymentError = null;
    });
    builder.addCase(createSetupIntent.fulfilled, (state, action) => {
      state.isLoading = false;
      state.setupIntentClientSecret = action.payload;
    });
    builder.addCase(createSetupIntent.rejected, (state, action) => {
      state.isLoading = false;
      state.paymentError = action.payload as string;
    });

    // Confirm booking
    builder.addCase(confirmBooking.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(confirmBooking.fulfilled, (state) => {
      state.isLoading = false;
      state.paymentStatus = "succeeded";
    });
    builder.addCase(confirmBooking.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Upload file
    builder.addCase(uploadPreCheckoutFile.pending, (state, action) => {
      const fieldId = action.meta.arg.fieldId;
      if (!state.fileUploads[fieldId]) {
        state.fileUploads[fieldId] = {
          uploading: false,
          progress: 0,
          error: null,
          files: [],
        };
      }
      state.fileUploads[fieldId].uploading = true;
      state.fileUploads[fieldId].progress = 0;
      state.fileUploads[fieldId].error = null;
    });
    builder.addCase(uploadPreCheckoutFile.fulfilled, (state, action) => {
      const { fieldId, file } = action.payload;
      if (state.fileUploads[fieldId]) {
        state.fileUploads[fieldId].uploading = false;
        state.fileUploads[fieldId].progress = 100;
        state.fileUploads[fieldId].files.push(file);
        // Update preCheckoutResponses with the files array
        state.preCheckoutResponses[fieldId] = state.fileUploads[fieldId].files;
      }
    });
    builder.addCase(uploadPreCheckoutFile.rejected, (state, action) => {
      const fieldId = action.meta.arg.fieldId;
      if (state.fileUploads[fieldId]) {
        state.fileUploads[fieldId].uploading = false;
        state.fileUploads[fieldId].error = action.payload as string;
      }
    });
  },
});

export const {
  setSelectedBoat,
  setPreCheckoutResponse,
  initFileUpload,
  setUploadProgress,
  removeUploadedFile,
  clearFileUploads,
  setPaymentStatus,
  setPaymentError,
  clearBookingState,
  clearSetupIntentClientSecret,
  clearError,
} = bookingSlice.actions;
export default bookingSlice.reducer;
