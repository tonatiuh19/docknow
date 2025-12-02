"use client";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />

      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <FiPackage className="text-ocean-600" />
              My Bookings
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and track your marina reservations
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <FiFilter className="w-5 h-5" />
                <span>Filter by:</span>
              </div>
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value as any)}
                  className={`relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 overflow-hidden group ${
                    selectedStatus === filter.value
                      ? "text-white shadow-lg scale-105"
                      : "text-gray-700 hover:text-ocean-600 hover:scale-105"
                  }`}
                >
                  {selectedStatus === filter.value && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                    </>
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Grid */}
          {bookings.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-xl p-16 text-center">
              <div className="text-7xl mb-6">
                <FiAnchor className="inline text-gray-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                No bookings found
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                {selectedStatus === "all"
                  ? "You haven't made any reservations yet. Start exploring marinas!"
                  : `You don't have any ${selectedStatus} bookings.`}
              </p>
              <Link
                href="/marinas"
                className="relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white overflow-hidden group hover:scale-105 transition-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                <span className="relative z-10">Browse Marinas</span>
                <FiChevronRight className="relative z-10" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.map((booking) => {
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                const isUpcoming = checkIn > new Date();
                const canCancel = booking.status === "confirmed" && isUpcoming;

                return (
                  <div
                    key={booking.id}
                    className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                  >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-ocean-600 to-sky-500 p-6 text-white overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(booking.status)}
                            <span className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </span>
                          </div>
                          <span className="text-sm opacity-90">
                            #{booking.id}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                          {booking.marina.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                          <FiMapPin className="w-4 h-4" />
                          <span>
                            {booking.marina.city}, {booking.marina.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Dates */}
                      <div className="flex items-start gap-3">
                        <FiCalendar className="w-5 h-5 text-ocean-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            Check-in
                          </div>
                          <div className="font-semibold text-gray-900">
                            {format(checkIn, "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-gray-600 mt-2 mb-1">
                            Check-out
                          </div>
                          <div className="font-semibold text-gray-900">
                            {format(checkOut, "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.totalDays}{" "}
                            {booking.totalDays === 1 ? "night" : "nights"}
                          </div>
                        </div>
                      </div>

                      {/* Boat & Slip */}
                      <div className="flex items-start gap-3">
                        <FiAnchor className="w-5 h-5 text-ocean-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Boat</div>
                          <div className="font-semibold text-gray-900">
                            {booking.boat.name}
                          </div>
                          {booking.slip && (
                            <>
                              <div className="text-sm text-gray-600 mt-2">
                                Slip
                              </div>
                              <div className="font-semibold text-gray-900">
                                {booking.slip.number}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                        <FiDollarSign className="w-5 h-5 text-ocean-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">
                            Total Amount
                          </div>
                          <div className="text-2xl font-bold text-ocean-600">
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
                    <div className="p-6 pt-0 flex gap-3">
                      <Link
                        href={`/marinas/${booking.marina.slug}`}
                        className="flex-1 relative px-4 py-3 rounded-xl font-semibold transition-all overflow-hidden group hover:scale-105 text-center flex items-center justify-center gap-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                        <span className="relative z-10 text-gray-700">
                          View Marina
                        </span>
                        <FiChevronRight className="relative z-10 w-4 h-4 text-gray-700" />
                      </Link>
                      {canCancel &&
                        !getCancellationRequestForBooking(booking.id) && (
                          <button
                            onClick={() => handleCancelClick(booking.id)}
                            className="relative px-4 py-3 rounded-xl font-semibold transition-all overflow-hidden group hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                            <FiAlertCircle className="relative z-10 w-4 h-4 text-white" />
                            <span className="relative z-10 text-white">
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
