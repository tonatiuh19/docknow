import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  totalAmount: number;
  isLoading: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
  totalAmount,
  isLoading: externalLoading,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSuccess(paymentIntent.id);
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Please provide your payment information.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred.");
        onError(error.message || "Payment failed");
      } else {
        setMessage("An unexpected error occurred.");
        onError("An unexpected error occurred");
      }
    } else if (paymentIntent.status === "succeeded") {
      setMessage("Payment succeeded!");
      onSuccess(paymentIntent.id);
    }

    setIsProcessing(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="p-6 bg-gradient-to-r from-ocean-50 to-emerald-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h4>
          <div className="text-2xl font-bold text-ocean-600">
            ${totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            }}
          />
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-start gap-2 p-4 rounded-lg text-sm ${
            message.includes("succeeded")
              ? "bg-green-50 border border-green-200 text-green-600"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </motion.div>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements || externalLoading}
        className="w-full h-12 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ${totalAmount.toFixed(2)}
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default StripePaymentForm;
