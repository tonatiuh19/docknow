import { StateCreator } from "zustand";
import { Notification } from "../types";

// Notification State
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

// Notification Actions
export interface NotificationActions {
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

// Notification Slice Type
export type NotificationSlice = NotificationState & NotificationActions;

// Initial State
const initialNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

// Create Notification Slice
export const createNotificationSlice: StateCreator<
  NotificationSlice,
  [["zustand/immer", never]],
  [],
  NotificationSlice
> = (set) => ({
  ...initialNotificationState,

  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    });
  },

  removeNotification: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter((n) => n.id !== id);
    });
  },

  markAsRead: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    });
  },

  markAllAsRead: () => {
    set((state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    });
  },

  clearAllNotifications: () => {
    set((state) => {
      state.notifications = [];
      state.unreadCount = 0;
    });
  },

  showSuccess: (message: string) => {
    set((state) => {
      const notification: Notification = {
        id: Math.random().toString(36).substring(7),
        type: "success",
        message,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    });
  },

  showError: (message: string) => {
    set((state) => {
      const notification: Notification = {
        id: Math.random().toString(36).substring(7),
        type: "error",
        message,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    });
  },

  showWarning: (message: string) => {
    set((state) => {
      const notification: Notification = {
        id: Math.random().toString(36).substring(7),
        type: "warning",
        message,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    });
  },

  showInfo: (message: string) => {
    set((state) => {
      const notification: Notification = {
        id: Math.random().toString(36).substring(7),
        type: "info",
        message,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    });
  },
});
