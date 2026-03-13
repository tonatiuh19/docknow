import React, { useEffect, useMemo, useState } from "react";
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
  Layers,
  Wrench,
  Plus,
  Filter,
  ArrowRight,
  Loader2,
  Ship,
  AlertCircle,
  MessageSquareText,
  Wallet,
  ClipboardCheck,
  CircleDashed,
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
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const getServiceTypeMeta = (serviceType?: string) => {
    switch (serviceType) {
      case "dry_stack":
        return {
          label: "Dry Stack",
          className: "bg-sky-100 text-sky-800 border-sky-200",
          icon: Layers,
        };
      case "shipyard_maintenance":
        return {
          label: "Shipyard",
          className: "bg-violet-100 text-violet-800 border-violet-200",
          icon: Wrench,
        };
      default:
        return {
          label: "Marina Slip",
          className: "bg-ocean-100 text-ocean-800 border-ocean-200",
          icon: Anchor,
        };
    }
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

  const displayedReservations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return filteredReservations.filter((reservation) => {
      const matchesServiceType =
        serviceTypeFilter === "all" ||
        reservation.serviceType === serviceTypeFilter;

      const matchesSearch =
        !normalizedSearch ||
        reservation.marina.name.toLowerCase().includes(normalizedSearch) ||
        reservation.marina.city.toLowerCase().includes(normalizedSearch);

      return matchesServiceType && matchesSearch;
    });
  }, [filteredReservations, serviceTypeFilter, searchTerm]);

  const dashboardStats = useMemo(() => {
    const active = displayedReservations.filter((r) =>
      ["confirmed", "pending", "pending_approval"].includes(r.status),
    ).length;

    const pendingApproval = displayedReservations.filter(
      (r) => r.status === "pending_approval",
    ).length;

    const totalBookedValue = displayedReservations.reduce(
      (sum, r) => sum + r.totalAmount,
      0,
    );

    return {
      active,
      pendingApproval,
      totalBookedValue,
    };
  }, [displayedReservations]);

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
        description="View and manage your DockNow reservations across slip, dry stack, and shipyard services. Track active bookings, statuses, and upcoming marina stays in one dashboard."
        keywords="docknow reservations dashboard, marina reservations, dry stack bookings, shipyard bookings, booking management"
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
        noindex={true}
      />
      <div className="min-h-screen bg-navy-50/30">
        {/* Header */}
        <div className="relative bg-navy-950 pt-32 pb-20 overflow-hidden">
          <motion.div
            animate={{
              x: [-30, 30],
              opacity: [0.1, 0.16, 0.1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-ocean-500 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              y: [-15, 15],
              opacity: [0.08, 0.14, 0.08],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="absolute -top-16 -right-10 w-80 h-80 bg-cyan-400 rounded-full blur-[110px]"
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
                A single dashboard for slip, dry stack, and shipyard bookings.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">
                    Active Bookings
                  </p>
                  <p className="text-3xl font-black text-navy-900 mt-2">
                    {dashboardStats.active}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">
                    Pending Approval
                  </p>
                  <p className="text-3xl font-black text-navy-900 mt-2">
                    {dashboardStats.pendingApproval}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CircleDashed className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">
                    Booked Value
                  </p>
                  <p className="text-3xl font-black text-navy-900 mt-2">
                    €{dashboardStats.totalBookedValue.toFixed(0)}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
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
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
              <Select
                value={serviceTypeFilter}
                onValueChange={setServiceTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-44 h-12 rounded-xl border-navy-200 bg-white hover:bg-navy-50">
                  <div className="flex items-center gap-2">
                    <Anchor className="w-4 h-4" />
                    <SelectValue placeholder="Service" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="slip">Marina Slip</SelectItem>
                  <SelectItem value="dry_stack">Dry Stack</SelectItem>
                  <SelectItem value="shipyard_maintenance">Shipyard</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-navy-200 bg-white hover:bg-navy-50">
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
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search marina or city"
                className="h-12 w-full sm:w-56 rounded-xl border border-navy-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-ocean-500"
              />
              <Link to="/discover" className="w-full sm:w-auto">
                <Button className="h-12 w-full sm:w-auto rounded-xl bg-gradient-ocean hover:shadow-glow text-white border-none px-6 flex items-center gap-2">
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
          {!isLoading && !error && displayedReservations.length > 0 && (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {displayedReservations.map((reservation) => (
                <motion.div key={reservation.id} variants={itemVariants}>
                  {(() => {
                    const serviceTypeMeta = getServiceTypeMeta(
                      reservation.serviceType,
                    );
                    const ServiceTypeIcon = serviceTypeMeta.icon;

                    return (
                      <Card className="hover:shadow-2xl transition-all duration-500 border-none shadow-xl bg-white group overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-48 bg-navy-50 flex items-center justify-center p-8 md:p-0 relative">
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8 }}
                                className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ocean-600"
                              >
                                <ServiceTypeIcon className="w-8 h-8" />
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
                                  <div className="mt-3">
                                    <Badge
                                      className={`${serviceTypeMeta.className} border px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5`}
                                    >
                                      <ServiceTypeIcon className="w-3.5 h-3.5" />
                                      {serviceTypeMeta.label}
                                    </Badge>
                                  </div>
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

                              {reservation.serviceType === "slip" &&
                                reservation.slip && (
                                  <div className="mb-4 text-sm text-gray-600">
                                    <span className="font-medium">Slip:</span>{" "}
                                    {reservation.slip.number}
                                  </div>
                                )}

                              <div className="flex flex-wrap gap-3 pt-6 border-t border-navy-50">
                                <Link
                                  to={`/discover/${reservation.marina.slug}`}
                                >
                                  <Button
                                    variant="outline"
                                    className="rounded-xl border-navy-100 hover:bg-navy-50 font-bold px-6"
                                  >
                                    View Marina
                                  </Button>
                                </Link>
                                <Link
                                  to={`/reservations/${reservation.id}/conversation`}
                                >
                                  <Button
                                    variant="outline"
                                    className="rounded-xl border-navy-100 hover:bg-navy-50 font-bold px-6 inline-flex items-center gap-2"
                                  >
                                    <MessageSquareText className="w-4 h-4" />
                                    Conversation
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
                    );
                  })()}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && !error && displayedReservations.length === 0 && (
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
