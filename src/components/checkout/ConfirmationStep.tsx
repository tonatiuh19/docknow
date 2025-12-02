"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import Link from "next/link";
import { FiCheckCircle, FiMail, FiCalendar, FiAnchor } from "react-icons/fi";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ConfirmationStep() {
  const router = useRouter();
  const marinaData = useStore((state) => state.marinaData);
  const checkIn = useStore((state) => state.checkIn);
  const checkOut = useStore((state) => state.checkOut);
  const selectedBoat = useStore((state) => state.selectedBoat);
  const pricing = useStore((state) => state.pricing);
  const completedBookingId = useStore((state) => state.completedBookingId);
  const resetBooking = useStore((state) => state.resetBooking);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (completedBookingId) {
      fetchBookingDetails(completedBookingId.toString());
    } else {
      setLoading(false);
    }
  }, [completedBookingId]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.data);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        {/* Animated Ship Wheel */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-ocean-200 border-t-ocean-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiAnchor className="w-12 h-12 text-ocean-600 animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Confirming Your Booking
          </h3>
          <p className="text-gray-600">Securing your slip reservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <FiCheckCircle className="w-16 h-16 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600 text-lg">
          Your slip reservation has been successfully confirmed
        </p>
      </div>

      {/* Booking Reference */}
      {booking && (
        <div className="bg-ocean-50 border-2 border-ocean-200 rounded-lg p-6 inline-block">
          <p className="text-ocean-700 text-sm font-medium mb-1">
            Booking Reference
          </p>
          <p className="text-3xl font-bold text-ocean-900">#{booking.id}</p>
        </div>
      )}

      {/* Email Confirmation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-left max-w-2xl mx-auto">
        <FiMail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-blue-900 font-medium">Confirmation Email Sent</p>
          <p className="text-blue-700 text-sm">
            We've sent a confirmation email with your booking details and
            instructions for your arrival at {marinaData.name}.
          </p>
        </div>
      </div>

      {/* Booking Summary */}
      {booking && (
        <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Booking Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Marina</label>
              <p className="font-semibold text-gray-900">{marinaData.name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Boat</label>
              <p className="font-semibold text-gray-900">{booking.boat_name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600 flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Check-in
              </label>
              <p className="font-semibold text-gray-900">
                {new Date(booking.check_in_date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600 flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Check-out
              </label>
              <p className="font-semibold text-gray-900">
                {new Date(booking.check_out_date).toLocaleDateString()}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Total Paid</label>
              <p className="text-2xl font-bold text-ocean-600">
                ${booking.total_amount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={() => {
            resetBooking();
            router.push("/account/bookings");
          }}
          className="bg-ocean-600 hover:bg-ocean-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
        >
          <FiCalendar className="w-5 h-5" />
          View My Bookings
        </button>
        <button
          onClick={() => {
            resetBooking();
            router.push("/marinas");
          }}
          className="border-2 border-ocean-600 text-ocean-600 hover:bg-ocean-50 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
        >
          <FiAnchor className="w-5 h-5" />
          Browse More Marinas
        </button>
      </div>
    </div>
  );
}
