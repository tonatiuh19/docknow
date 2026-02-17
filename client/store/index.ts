import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import slices here
import discoveryReducer from "./slices/discoverySlice";
import marinaDetailReducer from "./slices/marinaDetailSlice";
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";
import reservationsReducer from "./slices/reservationsSlice";
import profileReducer from "./slices/profileSlice";
import hostAuthReducer from "./slices/hostAuthSlice";
import adminDashboardReducer from "./slices/adminDashboardSlice";
import adminBookingsReducer from "./slices/adminBookingsSlice";
import adminPaymentsReducer from "./slices/adminPaymentsSlice";
import adminHostsReducer from "./slices/adminHostsSlice";
import adminMarinasReducer from "./slices/adminMarinasSlice";

export const store = configureStore({
  reducer: {
    // Add slices here
    discovery: discoveryReducer,
    marinaDetail: marinaDetailReducer,
    auth: authReducer,
    booking: bookingReducer,
    reservations: reservationsReducer,
    profile: profileReducer,
    hostAuth: hostAuthReducer,
    adminDashboard: adminDashboardReducer,
    adminBookings: adminBookingsReducer,
    adminPayments: adminPaymentsReducer,
    adminHosts: adminHostsReducer,
    adminMarinas: adminMarinasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
