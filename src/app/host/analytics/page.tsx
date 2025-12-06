"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaEye,
  FaDesktop,
  FaMobile,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useStore } from "@/store/store";

interface AnalyticsData {
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    total_sessions: number;
    unique_users: number;
    logged_in_sessions: number;
    total_page_views: number;
    avg_time_per_page: number;
    total_checkout_started: number;
    total_bookings_completed: number;
    total_checkouts_abandoned: number;
    overall_conversion_rate: number;
  };
  dailyStats: Array<{
    visit_date: string;
    marina_id: number;
    marina_name: string;
    total_visitors: number;
    logged_in_visitors: number;
    anonymous_visitors: number;
    checkout_started: number;
    bookings_completed: number;
    checkouts_abandoned: number;
    conversion_rate: number;
  }>;
  topPages: Array<{
    page_type: string;
    view_count: number;
    avg_time_spent: number;
  }>;
  deviceBreakdown: Array<{
    device_type: string;
    session_count: number;
    percentage: number;
  }>;
  recentVisitors: Array<{
    session_id: string;
    user_id: number | null;
    user_name: string | null;
    user_email: string | null;
    marina_name: string;
    device_type: string;
    browser: string;
    country_code: string;
    city: string;
    started_at: string;
    last_activity_at: string;
    session_duration: number;
    pages_viewed: number;
    last_checkout_event: string | null;
  }>;
}

export default function HostAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const { hostToken } = useStore();

  useEffect(() => {
    if (hostToken) {
      fetchAnalytics();
    }
  }, [period, hostToken]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/host/visitor-analytics", {
        params: { period },
        headers: {
          Authorization: `Bearer ${hostToken}`,
        },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const summary = analytics?.summary;
  const conversionRate = summary?.overall_conversion_rate || 0;

  return (
    <>
      <MetaHelmet
        title="Marina Analytics | DockNow Host"
        description="Track marina visitor behavior and booking conversions"
        noindex={true}
        nofollow={true}
      />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 mb-2">
                Marina Analytics
              </h1>
              <p className="text-gray-600">
                Track visitor behavior and booking conversions for your marinas
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Period:
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-ocean-100 rounded-lg">
                <FaEye className="h-6 w-6 text-ocean-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy-900 mb-1">
              {summary?.total_sessions?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Total Sessions</p>
            <p className="text-xs text-gray-500 mt-2">
              {summary?.total_page_views?.toLocaleString() || 0} page views
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy-900 mb-1">
              {summary?.unique_users?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Unique Visitors</p>
            <p className="text-xs text-gray-500 mt-2">
              {summary?.logged_in_sessions?.toLocaleString() || 0} logged in
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy-900 mb-1">
              {summary?.total_checkout_started?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Checkouts Started</p>
            <p className="text-xs text-gray-500 mt-2">
              {summary?.total_checkouts_abandoned?.toLocaleString() || 0}{" "}
              abandoned
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy-900 mb-1">
              {conversionRate.toFixed(1)}%
            </h3>
            <p className="text-gray-600 text-sm">Conversion Rate</p>
            <p className="text-xs text-gray-500 mt-2">
              {summary?.total_bookings_completed?.toLocaleString() || 0}{" "}
              bookings completed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Device Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-ocean-600" />
              Device Breakdown
            </h2>
            <div className="space-y-4">
              {analytics?.deviceBreakdown?.map((device) => (
                <div key={device.device_type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {device.device_type === "desktop" && (
                        <FaDesktop className="mr-2 text-gray-600" />
                      )}
                      {device.device_type === "mobile" && (
                        <FaMobile className="mr-2 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {device.device_type}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {device.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-ocean-600 h-2 rounded-full transition-all"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {device.session_count.toLocaleString()} sessions
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center">
              <FaEye className="mr-2 text-ocean-600" />
              Most Viewed Pages
            </h2>
            <div className="space-y-3">
              {analytics?.topPages?.slice(0, 5).map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-navy-900 capitalize">
                      {page.page_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg. {page.avg_time_spent}s per view
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ocean-600">
                      {page.view_count}
                    </p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Visitors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">
            Recent Visitors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Marina
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Device
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Pages
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentVisitors?.map((visitor, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(visitor.started_at).toLocaleDateString()}{" "}
                      {new Date(visitor.started_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {visitor.marina_name}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {visitor.user_name ? (
                        <div>
                          <p className="font-medium text-navy-900">
                            {visitor.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {visitor.user_email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Guest</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 capitalize">
                      {visitor.device_type}
                      <span className="text-xs text-gray-500 block">
                        {visitor.browser}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {visitor.city && visitor.country_code
                        ? `${visitor.city}, ${visitor.country_code}`
                        : visitor.country_code || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {visitor.pages_viewed}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {Math.floor(visitor.session_duration / 60)}m{" "}
                      {visitor.session_duration % 60}s
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {visitor.last_checkout_event === "booking_completed" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" /> Booked
                        </span>
                      ) : visitor.last_checkout_event ===
                        "checkout_abandoned" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimesCircle className="mr-1" /> Abandoned
                        </span>
                      ) : visitor.last_checkout_event ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <FaShoppingCart className="mr-1" /> In Progress
                        </span>
                      ) : (
                        <span className="text-gray-500">Browsing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
