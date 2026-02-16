import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Anchor, Calendar, Ship } from "lucide-react";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";

interface PaymentResultProps {
  status: "success" | "failure";
  bookingId?: number;
  totalAmount?: number;
  marina?: any;
  slip?: any;
  boat?: any;
  checkInDate?: Date;
  checkOutDate?: Date;
  error?: string;
  onClose: () => void;
  onRetry?: () => void;
}

const PaymentResult: React.FC<PaymentResultProps> = ({
  status,
  bookingId,
  totalAmount,
  marina,
  slip,
  boat,
  checkInDate,
  checkOutDate,
  error,
  onClose,
  onRetry,
}) => {
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (status === "success") {
      setShowConfetti(true);
      // Stop confetti after 4 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "--";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (status === "success") {
    return (
      <>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={[
              "#0891b2",
              "#0e7490",
              "#155e75",
              "#164e63",
              "#0f766e",
              "#047857",
            ]}
            gravity={0.3}
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed! 🎉
            </h3>
            <p className="text-gray-600">
              Your payment was successful and your booking is confirmed.
            </p>
          </motion.div>

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                Booking #{bookingId}
              </h4>
              <div className="text-lg font-bold text-green-600">
                ${totalAmount?.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {marina && (
                <div className="flex items-start gap-2">
                  <Anchor className="h-4 w-4 text-ocean-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Marina</p>
                    <p className="font-medium text-gray-900">{marina.name}</p>
                    {slip && (
                      <p className="text-xs text-gray-500">
                        Slip {slip.slipNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {boat && (
                <div className="flex items-start gap-2">
                  <Ship className="h-4 w-4 text-ocean-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Boat</p>
                    <p className="font-medium text-gray-900">
                      {boat.boat_name}
                    </p>
                    <p className="text-xs text-gray-500">{boat.boat_type}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 col-span-2">
                <Calendar className="h-4 w-4 text-ocean-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-600">Dates</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Check-in</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(checkInDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Check-out</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(checkOutDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to you with all the details.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => (window.location.href = "/reservations")}
                className="flex-1 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
              >
                View My Bookings
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Continue Browsing
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </>
    );
  }

  // Failure state
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h3>
        <p className="text-gray-600 mb-4">
          We couldn't process your payment. Please try again.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3"
      >
        {onRetry && (
          <Button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
          >
            Try Again
          </Button>
        )}
        <Button variant="outline" onClick={onClose} className="flex-1">
          {onRetry ? "Cancel" : "Close"}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default PaymentResult;
