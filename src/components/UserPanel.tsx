"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import {
  FaUser,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaAnchor,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    full_name?: string;
    email?: string;
    phone?: string;
    country_code?: string;
  } | null;
  onLogout: () => void;
}

export default function UserPanel({
  isOpen,
  onClose,
  user,
  onLogout,
}: UserPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const menuItems = [
    {
      icon: FaUser,
      label: "My Profile",
      href: "/profile",
      color: "from-cyan-500 to-blue-500",
      description: "View and edit your profile",
    },
    {
      icon: FaHistory,
      label: "My Bookings",
      href: "/bookings",
      color: "from-blue-500 to-indigo-500",
      description: "Track your reservations",
    },
    {
      icon: FaCog,
      label: "Settings",
      href: "/settings",
      color: "from-purple-500 to-pink-500",
      description: "Preferences & notifications",
    },
  ];

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-[101] transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-50 animate-shimmer pointer-events-none" />

        {/* Content */}
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-6 shadow-xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 group z-10"
              aria-label="Close panel"
            >
              <IoClose className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="relative pt-8">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-2 border-white/20">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                    {user?.full_name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 text-cyan-50">
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* User Info Cards */}
              <div className="space-y-2">
                {user?.email && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group">
                    <MdEmail className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-white/90 truncate">
                      {user.email}
                    </span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group">
                    <MdPhone className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-white/90">
                      {user.country_code} {user.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="group relative block rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen
                    ? "slideInRight 0.4s ease-out forwards"
                    : "none",
                  opacity: 0,
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg group-hover:text-cyan-300 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>

                  <div className="text-gray-600 group-hover:text-cyan-400 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer - Logout */}
          <div className="p-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
            <button
              onClick={handleLogout}
              className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <div className="relative w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <FaSignOutAlt className="w-5 h-5" />
              </div>
              <span className="relative font-semibold text-lg">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );

  return createPortal(panelContent, document.body);
}
