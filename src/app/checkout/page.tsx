"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/store";
import LoadingSpinner from "@/components/LoadingSpinner";
import BoatSelectionStep from "@/components/checkout/BoatSelectionStep";
import BookingDetailsStep from "@/components/checkout/BookingDetailsStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ConfirmationStep from "@/components/checkout/ConfirmationStep";
import {
  FiCheck,
  FiAnchor,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
} from "react-icons/fi";

type CheckoutStep = "boat" | "details" | "payment" | "confirmation";

interface StepConfig {
  id: CheckoutStep;
  label: string;
  icon: React.ReactNode;
}

const steps: StepConfig[] = [
  { id: "boat", label: "Select Boat", icon: <FiAnchor className="w-5 h-5" /> },
  {
    id: "details",
    label: "Booking Details",
    icon: <FiCalendar className="w-5 h-5" />,
  },
  {
    id: "payment",
    label: "Payment",
    icon: <FiCreditCard className="w-5 h-5" />,
  },
  {
    id: "confirmation",
    label: "Confirmation",
    icon: <FiCheckCircle className="w-5 h-5" />,
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("boat");
  const [loading, setLoading] = useState(true);

  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const marinaData = useStore((state) => state.marinaData);
  const checkIn = useStore((state) => state.checkIn);
  const checkOut = useStore((state) => state.checkOut);
  const setMarinaData = useStore((state) => state.setMarinaData);
  const setCheckInOut = useStore((state) => state.setCheckInOut);
  const resetBooking = useStore((state) => state.resetBooking);

  const marinaSlug = searchParams?.get("marinaSlug") || null;
  const checkInParam = searchParams?.get("checkIn") || null;
  const checkOutParam = searchParams?.get("checkOut") || null;

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(`/marinas/${marinaSlug}`);
      return;
    }

    // Validate required params
    if (!marinaSlug || !checkInParam || !checkOutParam) {
      router.push("/marinas");
      return;
    }

    // Set dates in store
    setCheckInOut(checkInParam, checkOutParam);

    fetchMarinaData();
  }, [marinaSlug, checkInParam, checkOutParam, isAuthenticated]);

  const fetchMarinaData = async () => {
    try {
      const response = await fetch(`/api/marinas/${marinaSlug}`);
      const data = await response.json();

      if (data.success) {
        setMarinaData(data.data);
      } else {
        router.push("/marinas");
      }
    } catch (error) {
      console.error("Error fetching marina:", error);
      router.push("/marinas");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex((s) => s.id === currentStep);
  };

  if (loading) {
    return (
      <>
        <MetaHelmet
          title="Checkout | DockNow"
          description="Complete your marina slip booking"
          noindex={true}
          nofollow={true}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="xl" message="Loading checkout..." />
        </div>
      </>
    );
  }

  if (!marinaData) {
    return null;
  }

  return (
    <>
      <MetaHelmet
        title="Checkout | DockNow"
        description="Complete your marina slip booking"
        noindex={true}
        nofollow={true}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Booking
            </h1>
            <p className="text-gray-600">
              {marinaData.name} • {checkIn} to {checkOut}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const currentIndex = getCurrentStepIndex();
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-ocean-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <FiCheck className="w-6 h-6" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          isCurrent ? "text-ocean-600" : "text-gray-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-4 mb-6 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === "boat" && (
              <BoatSelectionStep onNext={handleNextStep} />
            )}
            {currentStep === "details" && (
              <BookingDetailsStep
                onNext={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}
            {currentStep === "payment" && (
              <PaymentStep
                onNext={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}
            {currentStep === "confirmation" && <ConfirmationStep />}
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="xl" message="Loading..." />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
