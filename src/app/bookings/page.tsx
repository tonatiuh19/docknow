"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  FiCalendar,
  FiMapPin,
  FiAnchor,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiChevronRight,
  FiX,
  FiPackage,
} from "react-icons/fi";
import { format } from "date-fns";

export default function MyBookingsPage() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const bookings = useStore((state) => state.bookings);
  const isLoading = useStore((state) => state.isLoading);
  const selectedStatus = useStore((state) => state.selectedStatus);
  const cancellationRequests = useStore((state) => state.cancellationRequests);
  const fetchMyBookings = useStore((state) => state.fetchMyBookings);
  const setSelectedStatus = useStore((state) => state.setSelectedStatus);
  const requestCancellation = useStore((state) => state.requestCancellation);

  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token");
    console.log(
      "Auth check - token:",
      token ? "exists" : "missing",
      "isAuthenticated:",
      isAuthenticated
    );

    if (!token && !isAuthenticated) {
      console.log("Not authenticated, redirecting...");
      router.push("/");
      return;
    }

    console.log("Calling fetchMyBookings...");
    fetchMyBookings()
      .then(() => {
        console.log("fetchMyBookings completed");
      })
      .catch((error) => {
        console.error("fetchMyBookings error:", error);
      });
  }, [isAuthenticated, router, fetchMyBookings]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case "completed":
        return <FiCheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    switch (status) {
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "completed":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleCancelClick = (bookingId: number) => {
    setSelectedBooking(bookingId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    setSubmitting(true);
    try {
      await requestCancellation(selectedBooking, cancelReason);
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason("");
      alert(
        "Cancellation request submitted successfully! The marina host will review your request."
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit cancellation request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCancellationRequestForBooking = (bookingId: number) => {
    return cancellationRequests.find((req) => req.bookingId === bookingId);
  };

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ocean-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50/20 to-slate-50">
      <Header />

      {/* Professional Gradient Header Section - Similar to Admin Ports */}
      <div className="relative bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 py-16 mt-20 mb-10">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 overflow-hidden"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-slate-900/80 via-cyan-900/80 to-blue-900/80 overflow-hidden"></div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse overflow-hidden"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse overflow-hidden"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-2xl backdrop-blur-xl border border-cyan-400/30">
                  <FiPackage className="text-cyan-400 w-10 h-10" />
                </div>
                My Bookings
              </h1>
              <p className="text-cyan-100 text-lg ml-1">
                Manage and track your marina reservations
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">
                {bookings.length}
              </div>
              <div className="text-sm text-cyan-200 mb-4">
                Total Reservations
              </div>
            </div>
          </div>

          {/* Filter Dropdown in Hero Section */}
          <div className="flex justify-end relative z-[100]">
            <div className="relative inline-block">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/10 border-2 border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform backdrop-blur-xl">
                  <FiFilter className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-base">
                  Filter by Status:
                </span>
                <span className="font-bold text-cyan-300 text-base">
                  {statusFilters.find((f) => f.value === selectedStatus)?.label}
                </span>
                <svg
                  className={`w-5 h-5 text-white transition-transform duration-300 ${
                    showFilterDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 w-64 backdrop-blur-xl bg-white/95 border-2 border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden z-[9999]">
                    {statusFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setSelectedStatus(filter.value as any);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-5 py-4 transition-all duration-200 ${
                          selectedStatus === filter.value
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold"
                            : "text-slate-700 hover:bg-cyan-50 font-semibold"
                        }`}
                      >
                        {selectedStatus === filter.value && (
                          <FiCheckCircle className="w-5 h-5" />
                        )}
                        <span
                          className={
                            selectedStatus === filter.value ? "" : "ml-8"
                          }
                        >
                          {filter.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Bookings Grid */}
          {bookings.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-2xl p-20 text-center hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"></div>
                <div className="relative p-8 bg-gradient-to-br from-slate-100 to-cyan-50 rounded-full">
                  <FiAnchor className="inline text-slate-400 w-24 h-24" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 mt-8">
                No bookings found
              </h3>
              <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
                {selectedStatus === "all"
                  ? "You haven't made any reservations yet. Start exploring marinas!"
                  : `You don't have any ${selectedStatus} bookings.`}
              </p>
              <Link
                href="/marinas"
                className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-xl shadow-cyan-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"></div>
                <span className="relative z-10 text-lg">Browse Marinas</span>
                <FiChevronRight className="relative z-10 w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {bookings.map((booking) => {
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                const isUpcoming = checkIn > new Date();
                const canCancel = booking.status === "confirmed" && isUpcoming;

                return (
                  <div
                    key={booking.id}
                    className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                  >
                    {/* Professional Header with Gradient - Similar to Admin Ports */}
                    <div className="relative bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 p-8 text-white overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5"></div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xl border border-white/20">
                              {getStatusIcon(booking.status)}
                            </div>
                            <span className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm opacity-90 mb-1">
                              Booking ID
                            </div>
                            <div className="font-semibold">#{booking.id}</div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {booking.marina.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-cyan-100">
                          <FiMapPin className="w-4 h-4" />
                          <span>
                            {booking.marina.city}, {booking.marina.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                      {/* Dates */}
                      <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-slate-50 to-cyan-50/30 rounded-2xl border border-slate-100">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                          <FiCalendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
                                Check-in
                              </div>
                              <div className="font-bold text-slate-900 text-lg">
                                {format(checkIn, "MMM d, yyyy")}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
                                Check-out
                              </div>
                              <div className="font-bold text-slate-900 text-lg">
                                {format(checkOut, "MMM d, yyyy")}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <FiClock className="w-3 h-3" />
                            {booking.totalDays}{" "}
                            {booking.totalDays === 1 ? "night" : "nights"}
                          </div>
                        </div>
                      </div>

                      {/* Boat & Slip */}
                      <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-100">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                          <FiAnchor className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
                            Vessel Information
                          </div>
                          <div className="font-bold text-slate-900 text-lg mb-3">
                            {booking.boat.name}
                          </div>
                          {booking.slip && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span className="px-3 py-1 bg-white rounded-lg font-medium border border-slate-200">
                                Slip {booking.slip.number}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-4 pt-6 border-t-2 border-slate-100">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                          <FiDollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
                            Total Amount
                          </div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            ${booking.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Request Status */}
                      {(() => {
                        const cancelRequest = getCancellationRequestForBooking(
                          booking.id
                        );
                        if (cancelRequest) {
                          return (
                            <div
                              className={`p-4 rounded-lg border-2 ${
                                cancelRequest.status === "pending"
                                  ? "bg-yellow-50 border-yellow-200"
                                  : cancelRequest.status === "approved"
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {cancelRequest.status === "pending" && (
                                  <FiClock className="w-4 h-4 text-yellow-600" />
                                )}
                                {cancelRequest.status === "approved" && (
                                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                {cancelRequest.status === "rejected" && (
                                  <FiXCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span
                                  className={`font-semibold text-sm ${
                                    cancelRequest.status === "pending"
                                      ? "text-yellow-800"
                                      : cancelRequest.status === "approved"
                                      ? "text-green-800"
                                      : "text-red-800"
                                  }`}
                                >
                                  Cancellation{" "}
                                  {cancelRequest.status === "pending"
                                    ? "Pending"
                                    : cancelRequest.status === "approved"
                                    ? "Approved"
                                    : "Rejected"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                <strong>Your reason:</strong>{" "}
                                {cancelRequest.reason}
                              </p>
                              {cancelRequest.adminNotes && (
                                <p className="text-xs text-gray-600 mt-2">
                                  <strong>Host response:</strong>{" "}
                                  {cancelRequest.adminNotes}
                                </p>
                              )}
                              {cancelRequest.refundAmount && (
                                <p className="text-xs text-green-700 mt-2 font-semibold">
                                  Refund: $
                                  {parseFloat(
                                    cancelRequest.refundAmount.toString()
                                  ).toFixed(2)}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Actions */}
                    <div className="p-8 pt-0 flex gap-4">
                      <Link
                        href={`/marinas/${booking.marina.slug}`}
                        className="flex-1 relative px-6 py-4 rounded-2xl font-semibold transition-all overflow-hidden group hover:scale-105 text-center flex items-center justify-center gap-2 shadow-lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200"></div>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-slate-200 to-slate-300 transition-opacity"></div>
                        <span className="relative z-10 text-slate-700 font-bold">
                          View Marina
                        </span>
                        <FiChevronRight className="relative z-10 w-5 h-5 text-slate-700" />
                      </Link>
                      {canCancel &&
                        !getCancellationRequestForBooking(booking.id) && (
                          <button
                            onClick={() => handleCancelClick(booking.id)}
                            className="relative px-6 py-4 rounded-2xl font-semibold transition-all overflow-hidden group hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"></div>
                            <FiAlertCircle className="relative z-10 w-5 h-5 text-white" />
                            <span className="relative z-10 text-white font-bold">
                              Request Cancel
                            </span>
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Cancel Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Request Cancellation
            </h3>
            <p className="text-gray-600 mb-6">
              Submit a cancellation request to the marina host. They will review
              and respond to your request.
            </p>

            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for cancellation <span className="text-red-500">*</span>
              </span>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Please explain why you need to cancel..."
                required
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason("");
                }}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={submitting || !cancelReason.trim()}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
