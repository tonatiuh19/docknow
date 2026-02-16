import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Anchor,
  Check,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CreditCard,
  Loader2,
  Plus,
  Ship,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  File,
  Image,
  Trash2,
} from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import Confetti from "react-confetti";
import { stripePromise } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUserBoats,
  fetchBoatTypes,
  createBoat,
  fetchPreCheckoutSteps,
  createPaymentIntent,
  confirmBooking,
  uploadPreCheckoutFile,
  setSelectedBoat,
  setPreCheckoutResponse,
  initFileUpload,
  removeUploadedFile,
  clearFileUploads,
  setPaymentStatus,
  setPaymentError,
  clearBookingState,
  clearError,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import {
  validateFile,
  formatFileSize,
  getFileIcon,
  getFileExtension,
  isImageFile,
  createImagePreviewUrl,
} from "@/lib/fileUpload";

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  marina: any;
  slip: any;
  dateRange: {
    checkIn: string | null; // ISO string from Redux
    checkOut: string | null; // ISO string from Redux
  };
  totalCost: number;
  serviceFee: number;
  user: any;
}

type Step = "boat" | "pre-checkout" | "payment" | "result";

interface UserBoat {
  id: number;
  boat_name: string;
  boat_type: string;
  boat_type_id?: number;
  manufacturer?: string;
  model?: string;
  year?: number;
  length_meters: number;
  width_meters: number;
  draft_meters: number;
  home_marina?: string;
  registration_number?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
}

const BookingWizard: React.FC<BookingWizardProps> = ({
  isOpen,
  onClose,
  marina,
  slip,
  dateRange,
  totalCost,
  serviceFee,
  user,
}) => {
  const dispatch = useAppDispatch();
  const {
    boats,
    boatTypes,
    preCheckoutSteps,
    selectedBoat,
    preCheckoutResponses,
    fileUploads,
    paymentClientSecret,
    bookingId,
    paymentStatus,
    paymentError,
    isLoading,
    error,
  } = useAppSelector((state) => state.booking);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Convert ISO string dates to Date objects
  const checkInDate = dateRange.checkIn ? new Date(dateRange.checkIn) : null;
  const checkOutDate = dateRange.checkOut ? new Date(dateRange.checkOut) : null;

  // Calculate number of nights
  const nights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "--";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const [step, setStep] = useState<Step>("boat");
  const [showAddBoat, setShowAddBoat] = useState(false);
  const [newBoat, setNewBoat] = useState({
    boat_name: "",
    boat_type_id: "",
    manufacturer: "",
    model: "",
    year: "",
    length_meters: "",
    width_meters: "",
    draft_meters: "",
    home_marina: "",
    registration_number: "",
    insurance_provider: "",
    insurance_policy_number: "",
  });
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  // File upload handler
  const handleFileUpload = async (
    fieldId: number,
    field: any,
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    // Initialize upload state for field
    dispatch(initFileUpload({ fieldId }));

    const maxFiles = field.max_files || 1;
    const maxFileSize = field.max_file_size_mb || 10;
    const allowedTypes = field.file_types_allowed?.split(",") || [];

    // Validate files
    const fileArray = Array.from(files).slice(0, maxFiles);

    for (const file of fileArray) {
      const validation = validateFile(file, {
        maxFileSize,
        allowedTypes,
        maxFiles,
      });

      if (!validation.isValid) {
        console.error(`File validation failed: ${validation.error}`);
        continue;
      }

      // Create preview for images
      if (isImageFile(file.name)) {
        try {
          const previewUrl = await createImagePreviewUrl(file);
          setFilePreviews((prev) => ({
            ...prev,
            [`${fieldId}_${file.name}`]: previewUrl,
          }));
        } catch (error) {
          console.error("Failed to create preview:", error);
        }
      }

      // Upload the file
      try {
        await dispatch(
          uploadPreCheckoutFile({
            fieldId,
            file,
            field,
          }),
        ).unwrap();
      } catch (error: any) {
        console.error("File upload failed:", error);
      }
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fieldId: number, uploadId: string) => {
    dispatch(removeUploadedFile({ fieldId, uploadId }));

    // Remove preview if it exists
    setFilePreviews((prev) => {
      const newPreviews = { ...prev };
      Object.keys(newPreviews).forEach((key) => {
        if (key.includes(uploadId)) {
          delete newPreviews[key];
        }
      });
      return newPreviews;
    });
  };

  // Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    for (const step of preCheckoutSteps) {
      if (step.fields && step.fields.length > 0) {
        // Check field-level requirements
        for (const field of step.fields) {
          if (field.is_required) {
            if (
              field.field_type === "file" ||
              field.field_type === "multiple_files"
            ) {
              // For file fields, check if files are uploaded
              const files = fileUploads[field.id]?.files || [];
              if (files.length === 0) {
                return false;
              }
            } else {
              // For other fields, check regular response
              const response = preCheckoutResponses[field.id];
              if (
                !response ||
                (typeof response === "string" &&
                  response.toString().trim() === "")
              ) {
                return false;
              }
            }
          }
        }
      } else if (step.is_required) {
        // Fallback: check step-level requirement
        const response = preCheckoutResponses[step.id];
        if (
          !response ||
          (typeof response === "string" && response.toString().trim() === "")
        ) {
          return false;
        }
      }
    }
    return true;
  };

  // Load user boats and pre-checkout steps
  useEffect(() => {
    if (isOpen && user) {
      dispatch(fetchUserBoats());
      dispatch(fetchBoatTypes());
      dispatch(fetchPreCheckoutSteps(marina.id));
    }
  }, [isOpen, user, marina.id, dispatch]);

  // Clear state when closing
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearBookingState());
      setStep("boat");
      setShowAddBoat(false);
      setFilePreviews({});
    }
  }, [isOpen, dispatch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const validateBoatFit = (boat: UserBoat) => {
    return (
      boat.length_meters <= slip.length &&
      boat.width_meters <= slip.width &&
      boat.draft_meters <= slip.depth
    );
  };

  const handleSelectBoat = (boat: UserBoat) => {
    if (!validateBoatFit(boat)) {
      // Error will be shown in UI but boat won't be selected
      return;
    }
    dispatch(clearError());
    dispatch(setSelectedBoat(boat));
  };

  const handleAddBoat = async (e: React.FormEvent) => {
    e.preventDefault();

    const boatData = {
      boat_name: newBoat.boat_name,
      boat_type_id: newBoat.boat_type_id
        ? parseInt(newBoat.boat_type_id)
        : undefined,
      manufacturer: newBoat.manufacturer || undefined,
      model: newBoat.model || undefined,
      year: newBoat.year ? parseInt(newBoat.year) : undefined,
      length_meters: parseFloat(newBoat.length_meters),
      width_meters: parseFloat(newBoat.width_meters || "0"),
      draft_meters: parseFloat(newBoat.draft_meters || "0"),
      home_marina: newBoat.home_marina || undefined,
      registration_number: newBoat.registration_number || undefined,
      insurance_provider: newBoat.insurance_provider || undefined,
      insurance_policy_number: newBoat.insurance_policy_number || undefined,
    };

    // Validate fit before creating
    if (
      boatData.length_meters > slip.length ||
      boatData.width_meters > slip.width ||
      boatData.draft_meters > slip.depth
    ) {
      return; // Error will be shown in UI
    }

    const result = await dispatch(createBoat(boatData));

    if (createBoat.fulfilled.match(result)) {
      setShowAddBoat(false);
      setNewBoat({
        boat_name: "",
        boat_type_id: "",
        manufacturer: "",
        model: "",
        year: "",
        length_meters: "",
        width_meters: "",
        draft_meters: "",
        home_marina: "",
        registration_number: "",
        insurance_provider: "",
        insurance_policy_number: "",
      });
    }
  };

  const handleContinueFromBoat = () => {
    if (!selectedBoat) {
      return; // Error will be shown in UI
    }
    dispatch(clearError());
    if (preCheckoutSteps.length > 0) {
      setStep("pre-checkout");
    } else {
      setStep("payment");
    }
  };

  const handleContinueFromPreCheckout = () => {
    // Validate all required fields are filled
    if (!areRequiredFieldsFilled()) {
      setValidationError(
        "Please fill in all required fields before continuing.",
      );
      return;
    }

    setValidationError(null);
    dispatch(clearError());
    setStep("payment");
  };

  const handleCreatePaymentIntent = async () => {
    if (!selectedBoat || !checkInDate || !checkOutDate || !currentUser) return;

    const result = await dispatch(
      createPaymentIntent({
        userId: currentUser.id,
        marinaId: marina.id,
        boatId: selectedBoat.id,
        slipId: slip.id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        specialRequests:
          Object.entries(preCheckoutResponses)
            .map(([key, value]) => `${key}: ${value}`)
            .join("; ") || undefined,
      }),
    );

    if (createPaymentIntent.fulfilled.match(result)) {
      // Payment intent created successfully, stay on payment step
      console.log("Payment intent created:", result.payload.clientSecret);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!bookingId) return;

    // Immediately show success and start confirmation process
    dispatch(setPaymentStatus("succeeded"));
    setStep("result"); // Move to result step immediately

    // Then confirm booking in the background
    const result = await dispatch(
      confirmBooking({
        bookingId,
        paymentIntentId,
      }),
    );

    if (!confirmBooking.fulfilled.match(result)) {
      // If confirmation fails, handle error but payment already succeeded
      console.error("Booking confirmation failed:", result);
      dispatch(
        setPaymentError(
          "Booking confirmed but there was an issue with final confirmation. Please contact support.",
        ),
      );
    }
  };

  const handlePaymentError = (error: string) => {
    dispatch(setPaymentError(error));
  };

  const handleRetryPayment = () => {
    dispatch(setPaymentStatus("idle"));
    dispatch(clearError());
  };

  // Stripe Payment Form Component
  const StripePaymentForm: React.FC<{
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
    onProcessing: (processing: boolean) => void;
  }> = ({ onSuccess, onError, onProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Wait for elements to be ready
    useEffect(() => {
      if (elements) {
        const paymentElement = elements.getElement("payment");
        if (paymentElement) {
          paymentElement.on("ready", () => {
            setIsReady(true);
          });
        }
      }
    }, [elements]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements || !isReady) {
        onError(
          "Payment system is not ready. Please wait a moment and try again.",
        );
        return;
      }

      setProcessing(true);
      onProcessing(true);

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        setProcessing(false);
        onProcessing(false);

        if (error) {
          onError(error.message || "Payment failed");
        } else if (paymentIntent?.status === "succeeded") {
          onSuccess(paymentIntent.id);
        }
      } catch (err: any) {
        setProcessing(false);
        onProcessing(false);
        onError(err.message || "An unexpected error occurred");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-xl">
          <PaymentElement />
        </div>

        <Button
          type="submit"
          disabled={!stripe || !isReady || processing}
          className="w-full bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing payment...
            </>
          ) : !isReady ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading payment form...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Complete payment
            </>
          )}
        </Button>
      </form>
    );
  };

  const handleClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col lg:flex-row"
          >
            {/* Left Section - Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-navy-950 p-6 text-white z-10 border-b border-navy-800 rounded-tl-2xl">
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors lg:hidden z-[100]"
                >
                  <X className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold mb-2">
                  Complete your booking
                </h2>
                <p className="text-white/90 text-sm">
                  {marina.name} · Slip {slip.slipNumber}
                </p>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mt-4">
                  {["boat", "pre-checkout", "payment", "result"].map(
                    (s, idx) => {
                      const steps = [
                        "boat",
                        "pre-checkout",
                        "payment",
                        "result",
                      ];
                      const currentIdx = steps.indexOf(step);
                      const isActive = s === step;
                      const isCompleted = idx < currentIdx;

                      // Skip pre-checkout if no steps
                      if (s === "pre-checkout" && preCheckoutSteps.length === 0)
                        return null;

                      // Skip result unless we're on result step
                      if (s === "result" && step !== "result") return null;

                      return (
                        <React.Fragment key={s}>
                          <div
                            className={`flex-1 h-2 rounded-full transition-all ${
                              isCompleted
                                ? "bg-white"
                                : isActive
                                  ? "bg-white"
                                  : "bg-white/30"
                            }`}
                          />
                        </React.Fragment>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 1: Boat Selection */}
                  {step === "boat" && (
                    <motion.div
                      key="boat"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Select your boat
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Choose the boat you'll be bringing to this slip
                        </p>
                      </div>

                      {boats.length > 0 ? (
                        <div className="space-y-3">
                          {boats.map((boat) => {
                            const fits = validateBoatFit(boat);
                            return (
                              <button
                                key={boat.id}
                                onClick={() => handleSelectBoat(boat)}
                                disabled={!fits}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                  selectedBoat?.id === boat.id
                                    ? "border-ocean-500 bg-ocean-50"
                                    : fits
                                      ? "border-gray-200 hover:border-ocean-300 hover:bg-gray-50"
                                      : "border-red-200 bg-red-50/50 opacity-60 cursor-not-allowed"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Ship className="h-5 w-5 text-ocean-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {boat.boat_name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {boat.boat_type}
                                        {boat.manufacturer && boat.model && (
                                          <span className="text-gray-500">
                                            {" "}
                                            · {boat.manufacturer} {boat.model}
                                          </span>
                                        )}
                                        {boat.year && (
                                          <span className="text-gray-500">
                                            {" "}
                                            ({boat.year})
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {boat.length_meters}m ×{" "}
                                        {boat.width_meters}m ×{" "}
                                        {boat.draft_meters}m draft
                                      </p>
                                    </div>
                                  </div>
                                  {!fits && (
                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                      Too large
                                    </Badge>
                                  )}
                                  {selectedBoat?.id === boat.id && (
                                    <div className="w-6 h-6 bg-ocean-600 rounded-full flex items-center justify-center">
                                      <Check className="h-4 w-4 text-white" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Add Boat Form */}
                      {showAddBoat ? (
                        <form
                          onSubmit={handleAddBoat}
                          className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <h4 className="font-semibold text-gray-900">
                            Add a new boat
                          </h4>

                          <div className="space-y-4">
                            {/* Boat Name */}
                            <div>
                              <Label htmlFor="boat_name">
                                Boat name{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="boat_name"
                                value={newBoat.boat_name}
                                onChange={(e) =>
                                  setNewBoat({
                                    ...newBoat,
                                    boat_name: e.target.value,
                                  })
                                }
                                placeholder="e.g., Sea Explorer"
                                required
                              />
                            </div>

                            {/* Boat Type Dropdown */}
                            <div>
                              <Label htmlFor="boat_type_id">
                                Boat type{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={newBoat.boat_type_id}
                                onValueChange={(value) =>
                                  setNewBoat({
                                    ...newBoat,
                                    boat_type_id: value,
                                  })
                                }
                                required
                              >
                                <SelectTrigger id="boat_type_id">
                                  <SelectValue placeholder="Select boat type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {boatTypes.map((type) => (
                                    <SelectItem
                                      key={type.id}
                                      value={type.id.toString()}
                                    >
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Manufacturer & Model */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="manufacturer">
                                  Manufacturer
                                </Label>
                                <Input
                                  id="manufacturer"
                                  value={newBoat.manufacturer}
                                  onChange={(e) =>
                                    setNewBoat({
                                      ...newBoat,
                                      manufacturer: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Beneteau"
                                />
                              </div>
                              <div>
                                <Label htmlFor="model">Model</Label>
                                <Input
                                  id="model"
                                  value={newBoat.model}
                                  onChange={(e) =>
                                    setNewBoat({
                                      ...newBoat,
                                      model: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Oceanis 46.1"
                                />
                              </div>
                            </div>

                            {/* Year */}
                            <div>
                              <Label htmlFor="year">Year</Label>
                              <Input
                                id="year"
                                type="number"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={newBoat.year}
                                onChange={(e) =>
                                  setNewBoat({
                                    ...newBoat,
                                    year: e.target.value,
                                  })
                                }
                                placeholder="e.g., 2020"
                              />
                            </div>

                            {/* Dimensions */}
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-gray-700">
                                Dimensions{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label
                                    htmlFor="length"
                                    className="text-xs text-gray-600"
                                  >
                                    Length (m)
                                  </Label>
                                  <Input
                                    id="length"
                                    type="number"
                                    step="0.1"
                                    value={newBoat.length_meters}
                                    onChange={(e) =>
                                      setNewBoat({
                                        ...newBoat,
                                        length_meters: e.target.value,
                                      })
                                    }
                                    placeholder="15.0"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor="width"
                                    className="text-xs text-gray-600"
                                  >
                                    Width (m)
                                  </Label>
                                  <Input
                                    id="width"
                                    type="number"
                                    step="0.1"
                                    value={newBoat.width_meters}
                                    onChange={(e) =>
                                      setNewBoat({
                                        ...newBoat,
                                        width_meters: e.target.value,
                                      })
                                    }
                                    placeholder="4.5"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor="draft"
                                    className="text-xs text-gray-600"
                                  >
                                    Draft (m)
                                  </Label>
                                  <Input
                                    id="draft"
                                    type="number"
                                    step="0.1"
                                    value={newBoat.draft_meters}
                                    onChange={(e) =>
                                      setNewBoat({
                                        ...newBoat,
                                        draft_meters: e.target.value,
                                      })
                                    }
                                    placeholder="2.0"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Optional Fields - Collapsible */}
                            <Collapsible
                              open={showOptionalFields}
                              onOpenChange={setShowOptionalFields}
                            >
                              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-ocean-600 hover:text-ocean-700 transition-colors">
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    showOptionalFields ? "rotate-180" : ""
                                  }`}
                                />
                                {showOptionalFields ? "Hide" : "Show"} optional
                                details
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-4 space-y-4">
                                {/* Home Marina */}
                                <div>
                                  <Label htmlFor="home_marina">
                                    Home Marina
                                  </Label>
                                  <Input
                                    id="home_marina"
                                    value={newBoat.home_marina}
                                    onChange={(e) =>
                                      setNewBoat({
                                        ...newBoat,
                                        home_marina: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., San Diego Bay Marina"
                                  />
                                </div>

                                {/* Registration */}
                                <div>
                                  <Label htmlFor="registration_number">
                                    Registration Number
                                  </Label>
                                  <Input
                                    id="registration_number"
                                    value={newBoat.registration_number}
                                    onChange={(e) =>
                                      setNewBoat({
                                        ...newBoat,
                                        registration_number: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., CA1234AB"
                                  />
                                </div>

                                {/* Insurance */}
                                <div className="space-y-3">
                                  <Label className="text-sm font-semibold text-gray-700">
                                    Insurance Information
                                  </Label>
                                  <div className="space-y-3">
                                    <div>
                                      <Label
                                        htmlFor="insurance_provider"
                                        className="text-xs text-gray-600"
                                      >
                                        Provider
                                      </Label>
                                      <Input
                                        id="insurance_provider"
                                        value={newBoat.insurance_provider}
                                        onChange={(e) =>
                                          setNewBoat({
                                            ...newBoat,
                                            insurance_provider: e.target.value,
                                          })
                                        }
                                        placeholder="e.g., BoatUS"
                                      />
                                    </div>
                                    <div>
                                      <Label
                                        htmlFor="insurance_policy_number"
                                        className="text-xs text-gray-600"
                                      >
                                        Policy Number
                                      </Label>
                                      <Input
                                        id="insurance_policy_number"
                                        value={newBoat.insurance_policy_number}
                                        onChange={(e) =>
                                          setNewBoat({
                                            ...newBoat,
                                            insurance_policy_number:
                                              e.target.value,
                                          })
                                        }
                                        placeholder="e.g., POL-123456"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 bg-ocean-600 hover:bg-ocean-700"
                            >
                              {isLoading ? "Adding boat..." : "Add boat"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowAddBoat(false);
                                setShowOptionalFields(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddBoat(true)}
                          className="w-full border-2 border-dashed border-gray-300 hover:border-ocean-500 h-16"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add a new boat
                        </Button>
                      )}

                      {error && (
                        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <Button
                        onClick={handleContinueFromBoat}
                        disabled={!selectedBoat}
                        className="w-full h-12 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
                      >
                        Continue
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Pre-checkout Steps */}
                  {step === "pre-checkout" && (
                    <motion.div
                      key="pre-checkout"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Before you arrive
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Please provide the following information
                        </p>
                      </div>

                      <div className="space-y-5">
                        {preCheckoutSteps.map((step: any) => (
                          <div
                            key={step.id}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              step.is_required
                                ? "bg-white from-blue-50 to-ocean-50"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="space-y-4">
                              {/* Step Header */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900">
                                    {step.title}
                                  </h4>
                                  {step.is_required && (
                                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                {step.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {step.description}
                                  </p>
                                )}
                              </div>

                              {/* Dynamic Fields */}
                              {step.fields && step.fields.length > 0 ? (
                                <div className="space-y-4">
                                  {step.fields.map((field: any) => (
                                    <div key={field.id}>
                                      <Label
                                        htmlFor={`field-${field.id}`}
                                        className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2"
                                      >
                                        {field.field_label}
                                        {field.is_required && (
                                          <span className="text-red-500 text-xs">
                                            *
                                          </span>
                                        )}
                                      </Label>

                                      {/* Render field based on type */}
                                      {field.field_type === "text" && (
                                        <Input
                                          id={`field-${field.id}`}
                                          type="text"
                                          value={
                                            typeof preCheckoutResponses[
                                              field.id
                                            ] === "string"
                                              ? (preCheckoutResponses[
                                                  field.id
                                                ] as string)
                                              : ""
                                          }
                                          onChange={(e) =>
                                            dispatch(
                                              setPreCheckoutResponse({
                                                stepId: field.id,
                                                response: e.target.value,
                                              }),
                                            )
                                          }
                                          required={field.is_required}
                                          className="border-gray-300 focus:border-ocean-500 focus:ring-ocean-500"
                                        />
                                      )}

                                      {field.field_type === "textarea" && (
                                        <Textarea
                                          id={`field-${field.id}`}
                                          value={
                                            typeof preCheckoutResponses[
                                              field.id
                                            ] === "string"
                                              ? (preCheckoutResponses[
                                                  field.id
                                                ] as string)
                                              : ""
                                          }
                                          onChange={(e) =>
                                            dispatch(
                                              setPreCheckoutResponse({
                                                stepId: field.id,
                                                response: e.target.value,
                                              }),
                                            )
                                          }
                                          rows={4}
                                          required={field.is_required}
                                          className="resize-none border-gray-300 focus:border-ocean-500 focus:ring-ocean-500"
                                        />
                                      )}

                                      {(field.field_type === "file" ||
                                        field.field_type ===
                                          "multiple_files") && (
                                        <div className="space-y-3">
                                          <Input
                                            id={`field-${field.id}`}
                                            type="file"
                                            multiple={
                                              field.field_type ===
                                              "multiple_files"
                                            }
                                            accept={field.file_types_allowed
                                              ?.split(",")
                                              .map((ext) => `.${ext}`)
                                              .join(",")}
                                            onChange={(e) =>
                                              handleFileUpload(
                                                field.id,
                                                field,
                                                e.target.files,
                                              )
                                            }
                                            required={field.is_required}
                                            className="border-gray-300 focus:border-ocean-500 focus:ring-ocean-500"
                                          />

                                          {/* Upload Progress */}
                                          {fileUploads[field.id]?.uploading && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              <span>Uploading...</span>
                                            </div>
                                          )}

                                          {/* Upload Error */}
                                          {fileUploads[field.id]?.error && (
                                            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                              <span>
                                                {fileUploads[field.id].error}
                                              </span>
                                            </div>
                                          )}

                                          {/* Uploaded Files */}
                                          {fileUploads[field.id]?.files &&
                                            fileUploads[field.id].files.length >
                                              0 && (
                                              <div className="space-y-2">
                                                <Label className="text-xs font-medium text-gray-700">
                                                  Uploaded Files:
                                                </Label>
                                                {fileUploads[
                                                  field.id
                                                ].files.map((uploadedFile) => (
                                                  <div
                                                    key={uploadedFile.upload_id}
                                                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                                                  >
                                                    {/* File Icon */}
                                                    <div className="flex-shrink-0">
                                                      {isImageFile(
                                                        uploadedFile.original_name,
                                                      ) ? (
                                                        filePreviews[
                                                          `${field.id}_${uploadedFile.original_name}`
                                                        ] ? (
                                                          <img
                                                            src={
                                                              filePreviews[
                                                                `${field.id}_${uploadedFile.original_name}`
                                                              ]
                                                            }
                                                            alt={
                                                              uploadedFile.original_name
                                                            }
                                                            className="w-10 h-10 object-cover rounded"
                                                          />
                                                        ) : (
                                                          <Image className="h-6 w-6 text-green-600" />
                                                        )
                                                      ) : (
                                                        <File className="h-6 w-6 text-green-600" />
                                                      )}
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-medium text-gray-900 truncate">
                                                        {
                                                          uploadedFile.original_name
                                                        }
                                                      </p>
                                                      {uploadedFile.size && (
                                                        <p className="text-xs text-gray-500">
                                                          {formatFileSize(
                                                            uploadedFile.size,
                                                          )}
                                                        </p>
                                                      )}
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleRemoveFile(
                                                          field.id,
                                                          uploadedFile.upload_id,
                                                        )
                                                      }
                                                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                          {/* File Requirements */}
                                          <div className="text-xs text-gray-500 space-y-1">
                                            {field.file_types_allowed && (
                                              <p>
                                                Allowed types:{" "}
                                                {field.file_types_allowed.toUpperCase()}
                                              </p>
                                            )}
                                            {field.max_file_size_mb && (
                                              <p>
                                                Maximum size:{" "}
                                                {field.max_file_size_mb}MB per
                                                file
                                              </p>
                                            )}
                                            {field.max_files &&
                                              field.max_files > 1 && (
                                                <p>
                                                  Maximum files:{" "}
                                                  {field.max_files}
                                                </p>
                                              )}
                                          </div>
                                        </div>
                                      )}

                                      {field.field_type === "select" &&
                                        field.options && (
                                          <Select
                                            value={
                                              typeof preCheckoutResponses[
                                                field.id
                                              ] === "string"
                                                ? (preCheckoutResponses[
                                                    field.id
                                                  ] as string)
                                                : ""
                                            }
                                            onValueChange={(value) =>
                                              dispatch(
                                                setPreCheckoutResponse({
                                                  stepId: field.id,
                                                  response: value,
                                                }),
                                              )
                                            }
                                            required={field.is_required}
                                          >
                                            <SelectTrigger
                                              id={`field-${field.id}`}
                                            >
                                              <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {field.options.map(
                                                (option: string) => (
                                                  <SelectItem
                                                    key={option}
                                                    value={option}
                                                  >
                                                    {option}
                                                  </SelectItem>
                                                ),
                                              )}
                                            </SelectContent>
                                          </Select>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <Textarea
                                  id={`step-${step.id}`}
                                  value={
                                    typeof preCheckoutResponses[step.id] ===
                                    "string"
                                      ? (preCheckoutResponses[
                                          step.id
                                        ] as string)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    dispatch(
                                      setPreCheckoutResponse({
                                        stepId: step.id,
                                        response: e.target.value,
                                      }),
                                    )
                                  }
                                  placeholder="Type your response here..."
                                  rows={4}
                                  required={step.is_required}
                                  className="resize-none border-gray-300 focus:border-ocean-500 focus:ring-ocean-500"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {(error || validationError) && (
                        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{validationError || error}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStep("boat");
                            setValidationError(null);
                          }}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleContinueFromPreCheckout}
                          disabled={!areRequiredFieldsFilled()}
                          className="flex-1 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue
                          <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === "payment" && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Complete your payment
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Review your booking details and complete your payment
                        </p>
                      </div>

                      {/* Booking Summary */}
                      <div className="space-y-4">
                        {/* Dates */}
                        <div className="p-4 bg-gradient-to-r from-ocean-50 to-emerald-50 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Your trip
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Check-in</p>
                              <p className="font-semibold text-gray-900">
                                {formatDate(checkInDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Check-out</p>
                              <p className="font-semibold text-gray-900">
                                {formatDate(checkOutDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Boat */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Your boat
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                              <Ship className="h-5 w-5 text-ocean-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {selectedBoat?.boat_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {selectedBoat?.boat_type}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Price details
                          </h4>
                          <div className="flex justify-between text-gray-700">
                            <span>
                              ${slip.pricePerDay} × {nights} nights
                            </span>
                            <span>${(totalCost - serviceFee).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Service fee</span>
                            <span>${serviceFee.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between font-bold text-lg text-gray-900">
                              <span>Total</span>
                              <span>${totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Form */}
                      {!paymentClientSecret ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="h-6 w-6 text-ocean-600" />
                          </div>
                          <p className="text-gray-600 mb-4">
                            Setting up secure payment...
                          </p>
                          <Button
                            onClick={handleCreatePaymentIntent}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Preparing payment...
                              </>
                            ) : (
                              "Continue to payment"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {paymentStatus === "processing" && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center py-4 bg-blue-50 border border-blue-200 rounded-xl"
                            >
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                Processing your payment...
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                This usually takes just a few seconds
                              </p>
                            </motion.div>
                          )}
                          <Elements
                            stripe={stripePromise}
                            options={{
                              clientSecret: paymentClientSecret,
                              appearance: {
                                theme: "stripe",
                                variables: {
                                  colorPrimary: "#0369a1", // ocean-600
                                },
                              },
                            }}
                          >
                            <StripePaymentForm
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                              onProcessing={(processing) =>
                                dispatch(
                                  setPaymentStatus(
                                    processing ? "processing" : "idle",
                                  ),
                                )
                              }
                            />
                          </Elements>
                        </div>
                      )}

                      {(error || paymentError) && (
                        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{paymentError || error}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setStep(
                              preCheckoutSteps.length > 0
                                ? "pre-checkout"
                                : "boat",
                            )
                          }
                          className="flex-1"
                          disabled={paymentStatus === "processing"}
                        >
                          Back
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Payment Result */}
                  {step === "result" && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {paymentStatus === "succeeded" && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* Confetti for success */}
                          <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false}
                            numberOfPieces={200}
                            gravity={0.1}
                          />

                          <div className="text-center py-8">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: 0.2,
                                type: "spring",
                                stiffness: 200,
                              }}
                              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                              <CheckCircle className="h-12 w-12 text-green-600" />
                            </motion.div>
                            <motion.h3
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="text-2xl font-bold text-gray-900 mb-2"
                            >
                              Booking confirmed!
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              className="text-gray-600 mb-6"
                            >
                              Your marina booking has been successfully
                              confirmed. You'll receive a confirmation email
                              shortly.
                            </motion.p>

                            {/* Booking details */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                              className="bg-green-50 border border-green-200 rounded-xl p-6 text-left max-w-md mx-auto"
                            >
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Booking Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Booking ID
                                  </span>
                                  <span className="font-medium">
                                    #{bookingId}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Marina</span>
                                  <span className="font-medium">
                                    {marina.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Slip</span>
                                  <span className="font-medium">
                                    {slip.slipNumber}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Check-in
                                  </span>
                                  <span className="font-medium">
                                    {formatDate(checkInDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Check-out
                                  </span>
                                  <span className="font-medium">
                                    {formatDate(checkOutDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                  <span className="text-gray-900 font-semibold">
                                    Total Paid
                                  </span>
                                  <span className="font-semibold text-ocean-600">
                                    ${totalCost.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.0 }}
                            >
                              <Button
                                onClick={handleClose}
                                className="mt-6 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
                              >
                                Done
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {paymentStatus === "failed" && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="text-center py-8"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.2,
                              type: "spring",
                              stiffness: 200,
                            }}
                            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                          >
                            <XCircle className="h-12 w-12 text-red-600" />
                          </motion.div>
                          <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl font-bold text-gray-900 mb-2"
                          >
                            Payment failed
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-gray-600 mb-6"
                          >
                            We couldn't process your payment. Please try again
                            or use a different payment method.
                          </motion.p>

                          {paymentError && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto"
                            >
                              <p className="text-red-700 text-sm">
                                {paymentError}
                              </p>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="flex gap-3 justify-center"
                          >
                            <Button
                              variant="outline"
                              onClick={() => setStep("payment")}
                            >
                              Back to payment
                            </Button>
                            <Button
                              onClick={handleRetryPayment}
                              className="bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
                            >
                              Try again
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Section - Booking Summary */}
            <div className="hidden lg:block lg:w-[400px] bg-gray-50 border-l border-gray-200 overflow-y-auto rounded-tr-2xl">
              <div className="sticky top-0 p-6 space-y-6 relative">
                {/* Close button for desktop */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-[100] cursor-pointer hover:bg-gray-100 rounded-lg p-1.5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Marina Info */}
                <div className="space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
                    {marina.images && marina.images[0] ? (
                      <img
                        src={
                          typeof marina.images[0] === "string"
                            ? marina.images[0]
                            : marina.images[0].url
                        }
                        alt={marina.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Anchor className="h-12 w-12 text-white/80" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {marina.name}
                    </h3>
                    {(marina.location?.city ||
                      marina.location?.state ||
                      marina.location?.country) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {[
                            marina.location.city,
                            marina.location.state || marina.location.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                {/* Booking Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Booking details
                  </h4>

                  {/* Slip */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                      <Anchor className="h-4 w-4 text-ocean-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Slip {slip.slipNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {slip.length}m × {slip.width}m
                        {slip.minDepth && ` · ${slip.minDepth}m depth`}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-ocean-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(checkInDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(checkOutDate)}
                        </span>
                      </div>
                      {nights > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {nights} {nights === 1 ? "night" : "nights"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Boat */}
                  {selectedBoat && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                        <Ship className="h-4 w-4 text-ocean-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBoat.boat_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedBoat.boat_type}
                          {selectedBoat.manufacturer && selectedBoat.model && (
                            <span>
                              {" "}
                              · {selectedBoat.manufacturer} {selectedBoat.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-200" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Price details</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        ${slip.pricePerDay || marina.price_per_day} × {nights}{" "}
                        {nights === 1 ? "night" : "nights"}
                      </span>
                      <span className="text-gray-900">
                        ${(totalCost - serviceFee || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Service fee</span>
                      <span className="text-gray-900">
                        ${serviceFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-ocean-600">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Security Note */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">
                      You won't be charged yet. Complete your booking to
                      confirm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingWizard;
