"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { FiCalendar, FiDollarSign, FiTag } from "react-icons/fi";

interface BookingDetailsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function BookingDetailsStep({
  onNext,
  onBack,
}: BookingDetailsStepProps) {
  const marinaData = useStore((state) => state.marinaData);
  const checkIn = useStore((state) => state.checkIn);
  const checkOut = useStore((state) => state.checkOut);
  const selectedBoat = useStore((state) => state.selectedBoat);
  const specialRequests = useStore((state) => state.specialRequests);
  const setSpecialRequests = useStore((state) => state.setSpecialRequests);
  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const setAppliedCoupon = useStore((state) => state.setAppliedCoupon);
  const pricing = useStore((state) => state.pricing);
  const setPricing = useStore((state) => state.setPricing);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Update pricing in store whenever dependencies change
  useEffect(() => {
    if (!marinaData || !checkIn || !checkOut) return;

    const days = calculateDays();
    const subtotal = days * marinaData.pricePerDay;
    const serviceFee = subtotal * 0.1; // 10% service fee

    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === "percentage") {
        discountAmount = subtotal * (appliedCoupon.discount_value / 100);
      } else {
        discountAmount = appliedCoupon.discount_value;
      }
    }

    const total = subtotal + serviceFee - discountAmount;

    setPricing({
      days,
      subtotal,
      serviceFee,
      discountAmount,
      total,
    });
  }, [marinaData, checkIn, checkOut, appliedCoupon, setPricing]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch("/api/bookings/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          marinaId: marinaData.id,
          days: calculateDays(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Details
        </h2>
        <p className="text-gray-600">Review and confirm your reservation</p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          Reservation Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Marina</label>
            <p className="font-semibold text-gray-900">{marinaData.name}</p>
            <p className="text-sm text-gray-600">
              {marinaData.location.city}, {marinaData.location.state}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Boat</label>
            <p className="font-semibold text-gray-900">{selectedBoat?.name}</p>
            {selectedBoat?.model && (
              <p className="text-sm text-gray-600">
                {selectedBoat.manufacturer} {selectedBoat.model}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              Check-in
            </label>
            <p className="font-semibold text-gray-900">
              {checkIn
                ? new Date(checkIn).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              Check-out
            </label>
            <p className="font-semibold text-gray-900">
              {checkOut
                ? new Date(checkOut).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Duration</label>
            <p className="font-semibold text-gray-900">
              {pricing
                ? `${pricing.days} ${pricing.days === 1 ? "day" : "days"}`
                : "Calculating..."}
            </p>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          placeholder="Any special requests or requirements for your stay..."
        />
      </div>

      {/* Coupon Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FiTag className="w-4 h-4" />
          Coupon Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponError("");
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            placeholder="Enter coupon code"
            disabled={!!appliedCoupon}
          />
          {!appliedCoupon ? (
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={validatingCoupon}
              className="bg-ocean-600 hover:bg-ocean-700 disabled:bg-gray-300 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {validatingCoupon ? "Validating..." : "Apply"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAppliedCoupon(null);
                setCouponCode("");
              }}
              className="border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        {couponError && (
          <p className="text-red-600 text-sm mt-1">{couponError}</p>
        )}
        {appliedCoupon && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Coupon "{appliedCoupon.code}" applied!
            </p>
            <p className="text-green-700 text-sm">
              {appliedCoupon.description}
            </p>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      {pricing && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5" />
            Price Breakdown
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>
                ${marinaData?.pricePerDay || 0} × {pricing.days}{" "}
                {pricing.days === 1 ? "day" : "days"}
              </span>
              <span className="font-semibold">
                ${pricing.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Service fee (10%)</span>
              <span className="font-semibold">
                ${pricing.serviceFee.toFixed(2)}
              </span>
            </div>

            {appliedCoupon && pricing.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span className="font-semibold">
                  -${pricing.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
