"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import {
  FaShip,
  FaCalendarCheck,
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface DashboardStats {
  totalMarinas: number;
  totalSlips: number;
  availableSlips: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalGuests: number;
  revenueGrowth: number;
  bookingsGrowth: number;
}

export default function HostDashboardPage() {
  const { host } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalMarinas: 2,
        totalSlips: 45,
        availableSlips: 32,
        totalBookings: 128,
        activeBookings: 18,
        totalRevenue: 248500,
        monthlyRevenue: 32400,
        totalGuests: 89,
        revenueGrowth: 12.5,
        bookingsGrowth: 8.3,
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <MetaHelmet
        title="Host Dashboard | DockNow"
        description="Manage your marina, bookings, and guests"
        noindex={true}
        nofollow={true}
      />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Welcome back, {host?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your marinas today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-ocean-100 rounded-lg">
                <FaCalendarCheck className="h-6 w-6 text-ocean-600" />
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <FaArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-semibold">
                  {stats?.bookingsGrowth}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {stats?.totalBookings}
            </h3>
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-ocean-600 text-xs mt-2 font-medium">
              {stats?.activeBookings} active now
            </p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <FaArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-semibold">
                  {stats?.revenueGrowth}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              ${stats?.monthlyRevenue.toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Monthly Revenue</p>
            <p className="text-gray-500 text-xs mt-2">
              ${stats?.totalRevenue.toLocaleString()} total
            </p>
          </div>

          {/* Available Slips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaShip className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {stats?.availableSlips}/{stats?.totalSlips}
            </h3>
            <p className="text-gray-600 text-sm">Available Slips</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    ((stats?.availableSlips || 0) / (stats?.totalSlips || 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Total Guests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {stats?.totalGuests}
            </h3>
            <p className="text-gray-600 text-sm">Total Guests</p>
            <p className="text-purple-600 text-xs mt-2 font-medium">
              Registered users
            </p>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 rounded-lg transition flex items-center space-x-3">
                <FaShip className="h-5 w-5" />
                <span className="font-medium">Add New Slip</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition flex items-center space-x-3">
                <FaCalendarCheck className="h-5 w-5" />
                <span className="font-medium">View Bookings</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition flex items-center space-x-3">
                <FaChartLine className="h-5 w-5" />
                <span className="font-medium">View Reports</span>
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900">
                Recent Bookings
              </h2>
              <a
                href="/host/bookings"
                className="text-ocean-600 hover:text-ocean-700 text-sm font-medium"
              >
                View all →
              </a>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                      <FaShip className="h-5 w-5 text-ocean-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">Slip A-10{i}</p>
                      <p className="text-sm text-gray-600">
                        Guest Name • 3 nights
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-900">$850</p>
                    <p className="text-xs text-gray-500">Confirmed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
