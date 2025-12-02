"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FiLock, FiCreditCard } from "react-icons/fi";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

function PaymentForm({ onNext, onBack }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useStore((state) => state.user);
  const marinaData = useStore((state) => state.marinaData);
  const checkIn = useStore((state) => state.checkIn);
  const checkOut = useStore((state) => state.checkOut);
  const selectedBoat = useStore((state) => state.selectedBoat);
  const selectedSlipId = useStore((state) => state.selectedSlipId);
  const specialRequests = useStore((state) => state.specialRequests);
  const appliedCoupon = useStore((state) => state.appliedCoupon);
  const pricing = useStore((state) => state.pricing);
  const setCompletedBookingId = useStore(
    (state) => state.setCompletedBookingId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch("/api/bookings/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          marinaId: marinaData?.id,
          boatId: selectedBoat?.id,
          slipId: selectedSlipId,
          checkIn,
          checkOut,
          couponCode: appliedCoupon?.code,
          specialRequests,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.full_name,
              email: user?.email,
            },
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === "succeeded") {
        // Confirm booking
        const confirmResponse = await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: data.bookingId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmData.success) {
          // Store booking ID in Zustand
          setCompletedBookingId(confirmData.data.id);
          onNext();
        } else {
          throw new Error("Failed to confirm booking");
        }
      }
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
        <p className="text-gray-600">
          Enter your payment information to complete your booking
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FiLock className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-blue-900 font-medium">Secure Payment</p>
          <p className="text-blue-700 text-sm">
            Your payment information is encrypted and secure. We use Stripe for
            payment processing.
          </p>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FiCreditCard className="w-4 h-4" />
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-ocean-600 hover:bg-ocean-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <FiLock className="w-4 h-4" />
              Complete Booking
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        By completing this booking, you agree to our terms of service and
        cancellation policy.
      </p>
    </form>
  );
}

export default function PaymentStep(props: PaymentStepProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
