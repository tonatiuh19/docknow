import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/slices/adminDashboardSlice";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-ocean-500 to-ocean-600",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings?.toString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "from-navy-500 to-navy-600",
    },
    {
      title: "Active Bookings",
      value: stats?.activeBookings?.toString() || "0",
      change: "-2.4%",
      trend: "down",
      icon: Clock,
      color: "from-ocean-400 to-ocean-500",
    },
    {
      title: "Total Marinas",
      value: stats?.totalMarinas?.toString() || "0",
      change: "+1",
      trend: "up",
      icon: Building2,
      color: "from-navy-600 to-navy-700",
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <MetaHelmet
          title="Admin Dashboard"
          description="Monitor marina performance, bookings, revenue, and operational stats in the DockNow admin dashboard."
          noindex
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <TrendingUp className="h-8 w-8 text-ocean-600" />
            </div>
            <p className="text-navy-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MetaHelmet
        title="Admin Dashboard"
        description="Monitor marina performance, bookings, revenue, and operational stats in the DockNow admin dashboard."
        noindex
      />
      <div className="space-y-8">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-navy-900 mb-2"
          >
            Dashboard Overview
          </motion.h1>
          <p className="text-navy-600">
            Welcome back! Here's what's happening with your marinas today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
                />

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        stat.trend === "up" ? "text-ocean-600" : "text-navy-600"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-navy-500">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Bookings and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Calendar className="w-5 h-5 text-ocean-600" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentBookings.slice(0, 5).map((booking: any) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-ocean-50 hover:bg-ocean-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center text-white font-bold">
                            {booking.guest_name?.charAt(0) || "G"}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-900">
                              {booking.guest_name}
                            </p>
                            <p className="text-sm text-navy-500">
                              {booking.marina_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy-900">
                            ${booking.total_amount}
                          </p>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-ocean-100 text-ocean-700"
                                : booking.status === "pending"
                                  ? "bg-navy-100 text-navy-700"
                                  : "bg-slate-100 text-slate-700"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                    <p className="text-navy-500">No recent bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <TrendingUp className="w-5 h-5 text-ocean-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-ocean-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ocean-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-ocean-700 font-medium">
                        Confirmed
                      </p>
                      <p className="text-2xl font-bold text-ocean-900">
                        {stats?.bookingsByStatus?.find(
                          (s: any) => s.status === "confirmed",
                        )?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-navy-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-navy-700 font-medium">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-navy-900">
                        {stats?.bookingsByStatus?.find(
                          (s: any) => s.status === "pending",
                        )?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-ocean-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ocean-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-ocean-700 font-medium">
                        Total Guests
                      </p>
                      <p className="text-2xl font-bold text-ocean-900">
                        {stats?.recentBookings?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
