"use client";

import { useEffect } from "react";
import { useNotifications, Notification } from "@/store";

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.slice(0, 5).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: () => void;
}) {
  useEffect(() => {
    if (notification.type === "success" || notification.type === "info") {
      const timer = setTimeout(onRemove, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  const styles: Record<Notification["type"], { bg: string; icon: string }> = {
    success: { bg: "bg-green-500", icon: "✓" },
    error: { bg: "bg-red-500", icon: "✕" },
    warning: { bg: "bg-yellow-500", icon: "⚠" },
    info: { bg: "bg-blue-500", icon: "ℹ" },
  };

  const { bg, icon } = styles[notification.type];

  return (
    <div
      className={`${bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right`}
      role="alert"
    >
      <span className="text-2xl">{icon}</span>
      <p className="flex-1">{notification.message}</p>
      <button
        onClick={onRemove}
        className="text-white hover:text-gray-200 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
