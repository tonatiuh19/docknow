import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createMarinaSlice, MarinaSlice } from "./slices/marinaSlice";
import {
  createNotificationSlice,
  NotificationSlice,
} from "./slices/notificationSlice";
import { createBoatSlice, BoatSlice } from "./slices/boatSlice";
import { createBookingSlice, BookingSlice } from "./slices/bookingSlice";
import {
  createMyBookingsSlice,
  MyBookingsSlice,
} from "./slices/myBookingsSlice";

// Combined Store Type
export type Store = AuthSlice &
  MarinaSlice &
  NotificationSlice &
  BoatSlice &
  BookingSlice &
  MyBookingsSlice;

// Create the combined store with proper typing
export const useStore = create<Store>()(
  devtools(
    persist(
      immer((set, get, api) => ({
        ...createAuthSlice(set as any, get as any, api as any),
        ...createMarinaSlice(set as any, get as any, api as any),
        ...createNotificationSlice(set as any, get as any, api as any),
        ...createBoatSlice(set as any, get as any, api as any),
        ...createBookingSlice(set as any, get as any, api as any),
        ...createMyBookingsSlice(set as any, get as any, api as any),
      })),
      {
        name: "docknow-storage",
        partialize: (state) => ({
          // Only persist auth state
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "DockNow Store",
    }
  )
);

// Simple selector hooks - use direct property access to avoid object recreation
export const useAuth = () => {
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const authLoading = useStore((state) => state.authLoading);
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const checkAuth = useStore((state) => state.checkAuth);

  return {
    user,
    token,
    isAuthenticated,
    authLoading,
    login,
    logout,
    checkAuth,
  };
};

export const useMarinas = () => {
  const marinas = useStore((state) => state.marinas);
  const marinasLoading = useStore((state) => state.marinasLoading);
  const selectedMarina = useStore((state) => state.selectedMarina);
  const marinaAvailability = useStore((state) => state.marinaAvailability);
  const marinaAvailabilityLoading = useStore(
    (state) => state.marinaAvailabilityLoading
  );
  const marinaFilters = useStore((state) => state.marinaFilters);
  const marinaPagination = useStore((state) => state.marinaPagination);
  const filterOptions = useStore((state) => state.filterOptions);
  const filterOptionsLoading = useStore((state) => state.filterOptionsLoading);
  const fetchMarinas = useStore((state) => state.fetchMarinas);
  const fetchFilterOptions = useStore((state) => state.fetchFilterOptions);
  const fetchMarinaById = useStore((state) => state.fetchMarinaById);
  const fetchMarinaAvailability = useStore(
    (state) => state.fetchMarinaAvailability
  );
  const createMarina = useStore((state) => state.createMarina);
  const updateMarina = useStore((state) => state.updateMarina);
  const deleteMarina = useStore((state) => state.deleteMarina);
  const toggleMarinaStatus = useStore((state) => state.toggleMarinaStatus);
  const setSelectedMarina = useStore((state) => state.setSelectedMarina);
  const setMarinaFilters = useStore((state) => state.setMarinaFilters);
  const setMarinaPage = useStore((state) => state.setMarinaPage);

  return {
    marinas,
    marinasLoading,
    selectedMarina,
    marinaAvailability,
    marinaAvailabilityLoading,
    marinaFilters,
    marinaPagination,
    filterOptions,
    filterOptionsLoading,
    fetchMarinas,
    fetchFilterOptions,
    fetchMarinaById,
    fetchMarinaAvailability,
    createMarina,
    updateMarina,
    deleteMarina,
    toggleMarinaStatus,
    setSelectedMarina,
    setMarinaFilters,
    setMarinaPage,
  };
};
export const useNotifications = () => {
  const notifications = useStore((state) => state.notifications);
  const unreadCount = useStore((state) => state.unreadCount);
  const addNotification = useStore((state) => state.addNotification);
  const removeNotification = useStore((state) => state.removeNotification);
  const markAsRead = useStore((state) => state.markAsRead);
  const markAllAsRead = useStore((state) => state.markAllAsRead);
  const clearAllNotifications = useStore(
    (state) => state.clearAllNotifications
  );
  const showSuccess = useStore((state) => state.showSuccess);
  const showError = useStore((state) => state.showError);
  const showWarning = useStore((state) => state.showWarning);
  const showInfo = useStore((state) => state.showInfo);

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
export const useBoats = () => {
  const boats = useStore((state) => state.boats);
  const boatsLoading = useStore((state) => state.boatsLoading);
  const selectedBoat = useStore((state) => state.selectedBoat);
  const boatTypes = useStore((state) => state.boatTypes);
  const boatTypesLoading = useStore((state) => state.boatTypesLoading);
  const fetchBoats = useStore((state) => state.fetchBoats);
  const fetchBoatTypes = useStore((state) => state.fetchBoatTypes);
  const createBoat = useStore((state) => state.createBoat);
  const updateBoat = useStore((state) => state.updateBoat);
  const deleteBoat = useStore((state) => state.deleteBoat);
  const setSelectedBoat = useStore((state) => state.setSelectedBoat);

  return {
    boats,
    boatsLoading,
    selectedBoat,
    boatTypes,
    boatTypesLoading,
    fetchBoats,
    fetchBoatTypes,
    createBoat,
    updateBoat,
    deleteBoat,
    setSelectedBoat,
  };
};

export const useBooking = () => {
  const marinaData = useStore((state) => state.marinaData);
  const checkIn = useStore((state) => state.checkIn);
  const checkOut = useStore((state) => state.checkOut);
  const specialRequests = useStore((state) => state.specialRequests);
  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const pricing = useStore((state) => state.pricing);
  const completedBookingId = useStore((state) => state.completedBookingId);
  const setMarinaData = useStore((state) => state.setMarinaData);
  const setCheckInOut = useStore((state) => state.setCheckInOut);
  const setSpecialRequests = useStore((state) => state.setSpecialRequests);
  const setAppliedCoupon = useStore((state) => state.setAppliedCoupon);
  const setPricing = useStore((state) => state.setPricing);
  const setCompletedBookingId = useStore(
    (state) => state.setCompletedBookingId
  );
  const resetBooking = useStore((state) => state.resetBooking);

  return {
    marinaData,
    checkIn,
    checkOut,
    specialRequests,
    appliedCoupon,
    pricing,
    completedBookingId,
    setMarinaData,
    setCheckInOut,
    setSpecialRequests,
    setAppliedCoupon,
    setPricing,
    setCompletedBookingId,
    resetBooking,
  };
};
