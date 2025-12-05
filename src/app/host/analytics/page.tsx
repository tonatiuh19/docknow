"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import axios from "axios";
import {
  FaEye,
  FaUser,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaDesktop,
  FaMobile,
  FaTablet,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface VisitorAnalytics {
  dateRange: { start: string; end: string };
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
  dailyStats: any[];
  topPages: any[];
  checkoutFunnel: any[];
  recentVisitors: any[];
  deviceBreakdown: any[];
}

export default function VisitorAnalyticsPage() {
  const { hostToken } = useStore();
  const [analytics, setAnalytics] = useState<VisitorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [selectedMarina, setSelectedMarina] = useState<string>("");
  const [marinas, setMarinas] = useState<any[]>([]);

  useEffect(() => {
    fetchMarinas();
    fetchAnalytics();
  }, [period, selectedMarina]);

  const fetchMarinas = async () => {
    try {
      const response = await axios.get("/api/host/marinas", {
        headers: { Authorization: `Bearer ${hostToken}` },
      });
      setMarinas(response.data);
    } catch (error) {
      console.error("Failed to fetch marinas:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params: any = { period };
      if (selectedMarina) params.marinaId = selectedMarina;

      const response = await axios.get("/api/host/visitor-analytics", {
        headers: { Authorization: `Bearer ${hostToken}` },
        params,
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
      <>
        <MetaHelmet
          title="Visitor Analytics | DockNow Host"
          description="Track visitor behavior and analytics"
          noindex={true}
          nofollow={true}
        />
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  const summary = analytics?.summary || {
    total_sessions: 0,
    unique_users: 0,
    logged_in_sessions: 0,
    total_page_views: 0,
    avg_time_per_page: 0,
    total_checkout_started: 0,
    total_bookings_completed: 0,
    total_checkouts_abandoned: 0,
    overall_conversion_rate: 0,
  };

  return (
    <>
      <MetaHelmet
        title="Visitor Analytics | DockNow Host"
        description="Track visitor behavior and analytics"
        noindex={true}
        nofollow={true}
      />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Visitor Analytics
          </h1>
          <p className="text-gray-600">
            Track visitor behavior and conversion metrics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <select
            value={selectedMarina}
            onChange={(e) => setSelectedMarina(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          >
            <option value="">All Marinas</option>
            {marinas.map((marina) => (
              <option key={marina.id} value={marina.id}>
                {marina.name}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaEye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {summary.total_sessions?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Total Visitors</p>
            <p className="text-green-600 text-xs mt-2 font-medium">
              {summary.logged_in_sessions || 0} logged in
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {summary.total_checkout_started?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Checkout Started</p>
            <p className="text-gray-500 text-xs mt-2">
              {summary.total_page_views?.toLocaleString() || 0} page views
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {summary.total_bookings_completed?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Bookings Completed</p>
            <p className="text-green-600 text-xs mt-2 font-medium">
              {summary.overall_conversion_rate || 0}% conversion
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaTimesCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-1">
              {summary.total_checkouts_abandoned?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Checkouts Abandoned</p>
            <p className="text-gray-500 text-xs mt-2">
              Avg {summary.avg_time_per_page || 0}s per page
            </p>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4">
              Device Breakdown
            </h2>
            <div className="space-y-4">
              {analytics?.deviceBreakdown.map((device: any) => (
                <div key={device.device_type} className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    {device.device_type === "desktop" && (
                      <FaDesktop className="h-5 w-5 text-gray-600" />
                    )}
                    {device.device_type === "mobile" && (
                      <FaMobile className="h-5 w-5 text-gray-600" />
                    )}
                    {device.device_type === "tablet" && (
                      <FaTablet className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-navy-900 capitalize">
                        {device.device_type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {device.session_count} ({device.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-ocean-600 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Top Pages</h2>
            <div className="space-y-3">
              {analytics?.topPages.map((page: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-navy-900 capitalize">
                      {page.page_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg {page.avg_time_spent}s
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ocean-600">
                    {page.view_count} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Visitors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-navy-900">Recent Visitors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Marina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Pages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics?.recentVisitors.map((visitor: any) => (
                  <tr key={visitor.session_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-navy-900">
                          {visitor.user_name || "Anonymous"}
                        </p>
                        {visitor.user_email && (
                          <p className="text-xs text-gray-500">
                            {visitor.user_email}
                          </p>
                        )}
                        {visitor.city && (
                          <p className="text-xs text-gray-500">
                            {visitor.city}, {visitor.country_code}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.marina_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {visitor.device_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visitor.pages_viewed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(visitor.session_duration / 60)}m{" "}
                      {visitor.session_duration % 60}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {visitor.last_checkout_event === "booking_completed" && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          Booked
                        </span>
                      )}
                      {visitor.last_checkout_event === "checkout_abandoned" && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                          Abandoned
                        </span>
                      )}
                      {visitor.last_checkout_event === "checkout_started" && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                          In Progress
                        </span>
                      )}
                      {!visitor.last_checkout_event && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                          Browsing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(visitor.started_at).toLocaleDateString()}
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
