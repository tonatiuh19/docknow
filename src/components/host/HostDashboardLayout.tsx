"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store/store";
import {
  FaAnchor,
  FaHome,
  FaShip,
  FaCalendarAlt,
  FaCreditCard,
  FaUsers,
  FaPlus,
  FaHeadset,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface HostDashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/host/dashboard", icon: FaHome },
  { name: "Marina Management", href: "/host/marina", icon: FaShip },
  { name: "Bookings", href: "/host/bookings", icon: FaCalendarAlt },
  { name: "Analytics", href: "/host/analytics", icon: FaChartLine },
  { name: "Payments", href: "/host/payments", icon: FaCreditCard },
  { name: "Guests", href: "/host/guests", icon: FaUsers },
  { name: "Add Features", href: "/host/features", icon: FaPlus },
  { name: "Support", href: "/host/support", icon: FaHeadset },
  { name: "Settings", href: "/host/settings", icon: FaCog },
];

export default function HostDashboardLayout({
  children,
}: HostDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    host,
    hostIsAuthenticated,
    hostAuthLoading,
    checkHostAuth,
    hostLogout,
  } = useStore();

  useEffect(() => {
    checkHostAuth();
  }, [checkHostAuth]);

  useEffect(() => {
    if (hostAuthLoading === "succeeded" && !hostIsAuthenticated) {
      router.push("/host/login");
    }
  }, [hostIsAuthenticated, hostAuthLoading, router]);

  const handleLogout = () => {
    hostLogout();
    router.push("/host/login");
  };

  if (hostAuthLoading === "loading" || hostAuthLoading === "idle") {
    return (
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Sidebar - Fixed */}
        <aside className="w-64 bg-navy-900 text-white flex flex-col fixed left-0 top-0 bottom-0 z-30">
          {/* Logo */}
          <div className="p-6 border-b border-navy-800">
            <Link
              href="/host/dashboard"
              className="flex items-center space-x-3"
            >
              <div>
                <Image
                  src="https://garbrix.com/navios/assets/images/logo.png"
                  alt="DockNow Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
          {/* Navigation placeholder */}
          <nav className="flex-1 py-6 px-3">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        {/* Loading Content */}
        <main className="flex-1 ml-64 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!hostIsAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-navy-900 text-white flex flex-col fixed left-0 top-0 bottom-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-navy-800">
          <Link href="/host/dashboard" className="flex items-center space-x-3">
            <div>
              <Image
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="DockNow Logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? "bg-ocean-600 text-white"
                        : "text-gray-300 hover:bg-navy-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-navy-800">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-white truncate">
              {host?.full_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{host?.email}</p>
            {host?.company_name && (
              <p className="text-xs text-ocean-300 truncate mt-1">
                {host.company_name}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-navy-800 hover:text-white rounded-lg transition"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content - with left margin to account for fixed sidebar */}
      <main className="flex-1 ml-64 overflow-y-auto">{children}</main>
    </div>
  );
}
