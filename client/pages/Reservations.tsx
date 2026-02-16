import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Euro,
  Anchor,
  Plus,
  Filter,
  ArrowRight,
  Loader2,
  Ship,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchReservations,
  setStatusFilter,
  clearError,
} from "@/store/slices/reservationsSlice";

const Reservations = () => {
  const dispatch = useAppDispatch();
  const {
    reservations,
    filteredReservations,
    selectedStatus,
    isLoading,
    error,
  } = useAppSelector((state) => state.reservations);

  const [statusFilter, setStatusFilterLocal] = useState("all");

  useEffect(() => {
    dispatch(
      fetchReservations(statusFilter === "all" ? undefined : statusFilter),
    );
  }, [dispatch, statusFilter]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilterLocal(status);
    dispatch(setStatusFilter(status));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_approval":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-navy-100 text-navy-800 border-navy-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "pending_approval":
        return "Pending Approval";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUpcomingReservations = () => {
    return filteredReservations.filter((reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const today = new Date();
      return (
        checkIn >= today &&
        ["confirmed", "pending", "pending_approval"].includes(
          reservation.status,
        )
      );
    });
  };

  const upcomingCount = getUpcomingReservations().length;

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <Layout>
      <MetaHelmet
        title="My Reservations - DockNow"
        description="View and manage your marina slip reservations. Track upcoming bookings, view past stays, and manage your boat docking schedule with DockNow."
        keywords="marina reservations, booking management, my bookings, boat slip reservations, marina schedule"
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
        noindex={true}
      />
      <div className="min-h-screen bg-navy-50/30">
        {/* Header */}
        <div className="relative bg-navy-950 pt-32 pb-20 overflow-hidden">
          <motion.div
            animate={{
              x: [-20, 20],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-[100px]"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4 text-white"
              >
                My Reservations
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-ocean-100/80 max-w-2xl mx-auto"
              >
                Manage your global docking reservations and trip history.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
          >
            <div>
              <h2 className="text-3xl font-black text-navy-900 mb-2">
                {upcomingCount}{" "}
                {upcomingCount === 1 ? "Active Trip" : "Active Trips"}
              </h2>
              <p className="text-navy-500 font-medium">
                {upcomingCount > 0
                  ? "Your next adventure awaits!"
                  : "No upcoming trips scheduled."}
              </p>
            </div>
            <div className="flex gap-3">
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-48 h-12 rounded-xl border-navy-200 bg-white hover:bg-navy-50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reservations</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pending_approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Link to="/discover">
                <Button className="h-12 rounded-xl bg-gradient-ocean hover:shadow-glow text-white border-none px-6 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Booking
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-ocean-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your reservations...</p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-900 font-semibold mb-1">
                    Unable to load reservations
                  </h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button
                    onClick={() => dispatch(fetchReservations(undefined))}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reservations List */}
          {!isLoading && !error && filteredReservations.length > 0 && (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {filteredReservations.map((reservation) => (
                <motion.div key={reservation.id} variants={itemVariants}>
                  <Card className="hover:shadow-2xl transition-all duration-500 border-none shadow-xl bg-white group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 bg-navy-50 flex items-center justify-center p-8 md:p-0 relative">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.8 }}
                            className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ocean-600"
                          >
                            <Anchor className="w-8 h-8" />
                          </motion.div>
                        </div>
                        <div className="flex-1 p-8">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <Link
                                to={`/discover/${reservation.marina.slug}`}
                                className="text-2xl font-bold text-navy-900 mb-1 group-hover:text-ocean-600 transition-colors hover:underline"
                              >
                                {reservation.marina.name}
                              </Link>
                              <p className="text-navy-400 flex items-center gap-1.5 font-medium">
                                <MapPin className="w-4 h-4 text-ocean-500" />
                                {reservation.marina.city},{" "}
                                {reservation.marina.state}
                              </p>
                              {reservation.boat && (
                                <p className="text-navy-400 flex items-center gap-1.5 font-medium mt-1">
                                  <Ship className="w-4 h-4 text-ocean-500" />
                                  {reservation.boat.name}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={`${getStatusColor(reservation.status)} border px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase`}
                            >
                              {getStatusLabel(reservation.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-navy-300 uppercase tracking-widest">
                                Check-in
                              </p>
                              <div className="flex items-center gap-2 text-navy-900 font-bold">
                                <Calendar className="w-4 h-4 text-ocean-500" />
                                {formatDate(reservation.checkInDate)}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs font-bold text-navy-300 uppercase tracking-widest">
                                Nights
                              </p>
                              <div className="flex items-center gap-2 text-navy-900 font-bold">
                                <Clock className="w-4 h-4 text-ocean-500" />
                                {reservation.totalDays}{" "}
                                {reservation.totalDays === 1
                                  ? "Night"
                                  : "Nights"}
                              </div>
                            </div>

                            <div className="space-y-1 text-right sm:text-left">
                              <p className="text-xs font-bold text-navy-300 uppercase tracking-widest">
                                Total
                              </p>
                              <div className="flex items-center justify-end sm:justify-start gap-2 text-2xl font-black text-navy-900">
                                <Euro className="w-5 h-5 text-ocean-600" />
                                {reservation.totalAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {reservation.slip && (
                            <div className="mb-4 text-sm text-gray-600">
                              <span className="font-medium">Slip:</span>{" "}
                              {reservation.slip.number}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 pt-6 border-t border-navy-50">
                            <Link to={`/discover/${reservation.marina.slug}`}>
                              <Button
                                variant="outline"
                                className="rounded-xl border-navy-100 hover:bg-navy-50 font-bold px-6"
                              >
                                View Marina
                              </Button>
                            </Link>
                            {reservation.marina.phone && (
                              <Button
                                variant="outline"
                                className="rounded-xl border-navy-100 hover:bg-navy-50 font-bold px-6"
                              >
                                Contact Marina
                              </Button>
                            )}
                            {(reservation.status === "confirmed" ||
                              reservation.status === "pending") && (
                              <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold ml-auto"
                              >
                                Request Cancellation
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredReservations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="text-center py-20 px-8">
                  <div className="w-24 h-24 bg-ocean-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-ocean-600">
                    <Calendar className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-navy-900">
                    {selectedStatus === "all"
                      ? "No reservations yet"
                      : `No ${selectedStatus} reservations`}
                  </h3>
                  <p className="text-navy-500 text-lg mb-10 max-w-sm mx-auto">
                    {selectedStatus === "all"
                      ? "Your next great adventure is just a few clicks away."
                      : `You don't have any ${selectedStatus} reservations at the moment.`}
                  </p>
                  <Link to="/discover">
                    <Button className="h-16 px-12 rounded-2xl bg-gradient-ocean hover:shadow-glow text-white border-none text-xl font-bold transition-all hover:scale-105 active:scale-95 group">
                      Explore Marinas
                      <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reservations;
