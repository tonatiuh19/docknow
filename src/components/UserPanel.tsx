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
      icon: FaHistory,
      label: "My Bookings",
      href: "/bookings",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10",
      description: "Track your reservations",
    },
    {
      icon: FaCog,
      label: "Settings",
      href: "/profile",
      color: "from-cyan-600 to-blue-500",
      bgColor: "from-cyan-600/10 to-blue-500/10",
      description: "Preferences & notifications",
    },
  ];

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-[101] transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-blue-500/10 to-cyan-500/10 opacity-50 pointer-events-none" />

        {/* Content */}
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Header - Professional Gradient Similar to Admin Ports */}
          <div className="relative bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 p-8 shadow-xl overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5"></div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-110 hover:rotate-90 group z-10 shadow-lg"
              aria-label="Close panel"
            >
              <IoClose className="w-6 h-6 text-white transition-transform duration-300" />
            </button>

            <div className="relative pt-4">
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 backdrop-blur-xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl border-2 border-cyan-400/30">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    {user?.full_name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
                    <span className="text-sm font-semibold">Active</span>
                  </div>
                </div>
              </div>

              {/* User Info Cards */}
              <div className="space-y-3">
                {user?.email && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group shadow-lg">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <MdEmail className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-sm text-white/90 truncate font-medium">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/30">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="group relative block rounded-2xl bg-slate-800/50 backdrop-blur-xl p-6 border-2 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/20"
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
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-300 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-slate-600 group-hover:text-cyan-400 transition-all duration-300 group-hover:translate-x-1">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer - Logout */}
          <div className="p-6 border-t-2 border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            <button
              onClick={handleLogout}
              className="w-full group relative flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30 overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <div className="relative w-12 h-12 rounded-2xl bg-red-500/20 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                <FaSignOutAlt className="w-6 h-6" />
              </div>
              <span className="relative font-bold text-lg">Logout</span>
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
