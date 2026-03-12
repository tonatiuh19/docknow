/**
 * BookingFlow — inline (non-modal) multi-step booking.
 * Rendered directly inside MarinaDetail when "Reserve" is pressed.
 * Steps: boat → pre-checkout (if any) → payment → result
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  Ship,
  MapPin,
  Clock,
  Anchor,
  Layers,
  Wrench,
  CreditCard,
  CheckCircle,
  XCircle,
  File,
  Image,
  Trash2,
  Camera,
  Lock,
  Shield,
  Star,
  Sparkles,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import Confetti from "react-confetti";
import { stripePromise } from "@/lib/stripe";
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
  fetchSavedPaymentMethods,
  createSetupIntent,
  confirmBooking,
  uploadPreCheckoutFile,
  setSelectedBoat,
  setPreCheckoutResponse,
  initFileUpload,
  removeUploadedFile,
  setPaymentStatus,
  setPaymentError,
  clearBookingState,
  clearSetupIntentClientSecret,
  clearError,
} from "@/store/slices/bookingSlice";
import { RootState } from "@/store";
import {
  validateFile,
  formatFileSize,
  isImageFile,
  createImagePreviewUrl,
} from "@/lib/fileUpload";
import { uploadBoatPhoto } from "@/lib/cdnUpload";
import { logger } from "@/lib/logger";
import { BookingServiceType, BOOKING_SERVICE_TYPES } from "@shared/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingFlowProps {
  marina: any;
  slip: any;
  dateRange: { checkIn: string | null; checkOut: string | null };
  totalCost: number;
  serviceFee: number;
  serviceType: BookingServiceType;
  user: any;
  onBack: () => void;
}

type FlowStep = "boat" | "pre-checkout" | "payment" | "result";

const StripeForm: React.FC<{
  totalCost: number;
  onSuccess: (id: string) => void;
  onError: (msg: string) => void;
  onProcessing: (p: boolean) => void;
}> = ({ totalCost, onSuccess, onError, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!elements) return;
    const el = elements.getElement("payment");
    el?.on("ready", () => setReady(true));
  }, [elements]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !ready) {
      onError("Payment system not ready. Please wait a moment.");
      return;
    }
    setProcessing(true);
    onProcessing(true);
    logger.info("[BookingFlow][StripeForm] confirmPayment:start", {
      totalCost,
    });
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      setProcessing(false);
      onProcessing(false);
      if (error) {
        logger.error("[BookingFlow][StripeForm] confirmPayment:error", {
          message: error.message,
          code: (error as any)?.code,
        });
        onError(error.message ?? "Payment failed.");
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        logger.info("[BookingFlow][StripeForm] confirmPayment:succeeded", {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        });
        onSuccess(paymentIntent.id);
        return;
      }
      logger.warn("[BookingFlow][StripeForm] confirmPayment:non-success", {
        paymentIntentId: paymentIntent?.id,
        status: paymentIntent?.status,
      });
      onError("Payment not completed yet. Please try again.");
    } catch (err: any) {
      logger.error("[BookingFlow][StripeForm] confirmPayment:throw", {
        message: err?.message,
      });
      setProcessing(false);
      onProcessing(false);
      onError(err.message ?? "Unexpected error.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || !ready || processing}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:from-ocean-700 hover:to-ocean-800 transition-all shadow-md shadow-ocean-600/20"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : !ready ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay ${totalCost.toFixed(2)} securely
          </>
        )}
      </button>
    </form>
  );
};

const SetupPaymentMethodForm: React.FC<{
  onSuccess: () => void;
  onError: (msg: string) => void;
  onProcessing: (p: boolean) => void;
}> = ({ onSuccess, onError, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!elements) return;
    const el = elements.getElement("payment");
    el?.on("ready", () => setReady(true));
  }, [elements]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !ready) {
      onError("Payment form not ready. Please wait a moment.");
      return;
    }

    setProcessing(true);
    onProcessing(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      setProcessing(false);
      onProcessing(false);

      if (error) {
        onError(error.message ?? "Failed to save payment method");
        return;
      }

      if (setupIntent?.status === "succeeded") {
        onSuccess();
      }
    } catch (err: any) {
      setProcessing(false);
      onProcessing(false);
      onError(err.message ?? "Unexpected error while saving payment method");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || !ready || processing}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:from-ocean-700 hover:to-ocean-800 transition-all shadow-md shadow-ocean-600/20"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving method…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Save payment method
          </>
        )}
      </button>
    </form>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SVC_ICON: Record<BookingServiceType, React.ReactNode> = {
  slip: <Anchor className="h-4 w-4" />,
  dry_stack: <Layers className="h-4 w-4" />,
  shipyard_maintenance: <Wrench className="h-4 w-4" />,
};

const STEP_LABELS: Record<FlowStep, string> = {
  boat: "Your Vessel",
  "pre-checkout": "Details",
  payment: "Payment",
  result: "Confirmed",
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const fmtShort = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

const getNights = (checkIn: string | null, checkOut: string | null) => {
  if (!checkIn || !checkOut) return 0;
  return Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000,
  );
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const SUMMARY_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80",
];

// ─── Main component ───────────────────────────────────────────────────────────

const BookingFlow: React.FC<BookingFlowProps> = ({
  marina,
  slip,
  dateRange,
  totalCost,
  serviceFee,
  serviceType,
  user,
  onBack,
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
    setupIntentClientSecret,
    paymentMethods,
    defaultPaymentMethodId,
    bookingId,
    paymentStatus,
    paymentError,
    isLoading,
    error,
  } = useAppSelector((s: RootState) => s.booking);
  const { user: currentUser } = useAppSelector((s: RootState) => s.auth);

  const nights = getNights(dateRange.checkIn, dateRange.checkOut);
  const unitPrice = toNumber(slip?.pricePerDay ?? marina?.price_per_day ?? 0);

  // ── Step state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<FlowStep>("boat");
  const [showAddBoat, setShowAddBoat] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [boatPhotoFile, setBoatPhotoFile] = useState<File | null>(null);
  const [boatPhotoPreview, setBoatPhotoPreview] = useState<string | null>(null);
  const [boatPhotoUploading, setBoatPhotoUploading] = useState(false);
  const [selectedSavedPaymentMethodId, setSelectedSavedPaymentMethodId] =
    useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [summaryImageIndex, setSummaryImageIndex] = useState(0);
  const [isSummaryCarouselPaused, setIsSummaryCarouselPaused] = useState(false);

  const emptyBoat = {
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
  };
  const [newBoat, setNewBoat] = useState(emptyBoat);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(clearBookingState());
    dispatch(fetchUserBoats());
    dispatch(fetchBoatTypes());
    dispatch(fetchPreCheckoutSteps(marina.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [marina.id, dispatch]);

  // ── Wizard step list ───────────────────────────────────────────────────────
  const steps: FlowStep[] = [
    "boat",
    ...(preCheckoutSteps.length > 0 ? (["pre-checkout"] as FlowStep[]) : []),
    "payment",
  ];
  const currentStepIdx = steps.indexOf(step === "result" ? "payment" : step);

  // ── Boat fit check (only matters for slip) ─────────────────────────────────
  const boatFits = (b: any) =>
    serviceType !== "slip" ||
    (b.length_meters <= slip.length &&
      b.width_meters <= slip.width &&
      b.draft_meters <= slip.depth);

  // ── Pre-checkout required-fields check ────────────────────────────────────
  const preCheckoutComplete = () => {
    for (const s of preCheckoutSteps) {
      if (s.fields?.length > 0) {
        for (const f of s.fields) {
          if (!f.is_required) continue;
          if (f.field_type === "file" || f.field_type === "multiple_files") {
            if ((fileUploads[f.id]?.files ?? []).length === 0) return false;
          } else {
            const r = preCheckoutResponses[f.id];
            if (!r || (typeof r === "string" && !r.trim())) return false;
          }
        }
      } else if (s.is_required) {
        const r = preCheckoutResponses[s.id];
        if (!r || (typeof r === "string" && !r.trim())) return false;
      }
    }
    return true;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    let photoUrl: string | undefined;
    if (boatPhotoFile) {
      setBoatPhotoUploading(true);
      try {
        photoUrl = await uploadBoatPhoto(boatPhotoFile, "temp");
      } catch {
      } finally {
        setBoatPhotoUploading(false);
      }
    }
    const payload = {
      boat_name: newBoat.boat_name,
      boat_type_id: newBoat.boat_type_id ? +newBoat.boat_type_id : undefined,
      manufacturer: newBoat.manufacturer || undefined,
      model: newBoat.model || undefined,
      year: newBoat.year ? +newBoat.year : undefined,
      length_meters: +newBoat.length_meters,
      width_meters: +(newBoat.width_meters || "0"),
      draft_meters: +(newBoat.draft_meters || "0"),
      home_marina: newBoat.home_marina || undefined,
      registration_number: newBoat.registration_number || undefined,
      insurance_provider: newBoat.insurance_provider || undefined,
      insurance_policy_number: newBoat.insurance_policy_number || undefined,
      photo_url: photoUrl,
    };
    const result = await dispatch(createBoat(payload));
    if (createBoat.fulfilled.match(result)) {
      setShowAddBoat(false);
      setBoatPhotoFile(null);
      setBoatPhotoPreview(null);
      setNewBoat(emptyBoat);
    }
  };

  const handleFileUpload = async (
    fieldId: number,
    field: any,
    files: FileList | null,
  ) => {
    if (!files?.length) return;
    dispatch(initFileUpload({ fieldId }));
    const maxFiles = field.max_files || 1;
    const maxFileSize = field.max_file_size_mb || 10;
    const allowedTypes = field.file_types_allowed?.split(",") || [];
    for (const file of Array.from(files).slice(0, maxFiles)) {
      const v = validateFile(file, { maxFileSize, allowedTypes, maxFiles });
      if (!v.isValid) continue;
      if (isImageFile(file.name)) {
        try {
          const url = await createImagePreviewUrl(file);
          setFilePreviews((p) => ({ ...p, [`${fieldId}_${file.name}`]: url }));
        } catch {}
      }
      try {
        await dispatch(
          uploadPreCheckoutFile({ fieldId, file, field }),
        ).unwrap();
      } catch {}
    }
  };

  const handlePaymentSuccess = async (
    paymentIntentId: string,
    explicitBookingId?: number,
  ) => {
    const resolvedBookingId = explicitBookingId ?? bookingId;
    if (!resolvedBookingId) {
      logger.error("[BookingFlow] confirmBooking:missing-booking-id", {
        paymentIntentId,
        explicitBookingId,
        storeBookingId: bookingId,
      });
      return;
    }
    logger.info("[BookingFlow] confirmBooking:start", {
      bookingId: resolvedBookingId,
      paymentIntentId,
    });
    dispatch(setPaymentStatus("succeeded"));
    setStep("result");
    const result = await dispatch(
      confirmBooking({ bookingId: resolvedBookingId, paymentIntentId }),
    );
    if (confirmBooking.fulfilled.match(result)) {
      logger.info("[BookingFlow] confirmBooking:success", {
        bookingId: resolvedBookingId,
        paymentIntentId,
      });
    } else {
      logger.error("[BookingFlow] confirmBooking:failed", {
        bookingId: resolvedBookingId,
        paymentIntentId,
        error: (result as any)?.payload,
      });
    }
  };

  useEffect(() => {
    if (step === "payment") {
      logger.info("[BookingFlow] fetchSavedPaymentMethods:start", {
        bookingId,
      });
      dispatch(fetchSavedPaymentMethods());
    }
  }, [step, dispatch]);

  useEffect(() => {
    if (selectedSavedPaymentMethodId) return;
    const preferred = defaultPaymentMethodId || paymentMethods[0]?.id || null;
    setSelectedSavedPaymentMethodId(preferred);
  }, [paymentMethods, defaultPaymentMethodId, selectedSavedPaymentMethodId]);

  const galleryFromString =
    typeof marina?.gallery_image_urls === "string"
      ? marina.gallery_image_urls
          .split(",")
          .map((url: string) => url.trim())
          .filter(Boolean)
      : [];

  const galleryFromArray = Array.isArray(marina?.gallery_image_urls)
    ? marina.gallery_image_urls
        .map((url: unknown) => String(url || "").trim())
        .filter(Boolean)
    : [];

  const imagesFromObjects = Array.isArray(marina?.images)
    ? marina.images
        .map((img: any) =>
          typeof img === "string" ? img : (img?.url as string | undefined),
        )
        .filter((img: string | undefined): img is string => Boolean(img))
    : [];

  const marinaImages = Array.from(
    new Set(
      [
        marina?.primary_image_url,
        marina?.cover_image_url,
        ...imagesFromObjects,
        ...galleryFromString,
        ...galleryFromArray,
      ].filter(Boolean) as string[],
    ),
  );

  const summaryImages =
    marinaImages.length > 0 ? marinaImages : SUMMARY_FALLBACK_IMAGES;

  const summaryImage = summaryImages[summaryImageIndex] || null;

  useEffect(() => {
    setSummaryImageIndex(0);
  }, [marina?.id]);

  useEffect(() => {
    if (summaryImageIndex <= summaryImages.length - 1) return;
    setSummaryImageIndex(0);
  }, [summaryImageIndex, summaryImages.length]);

  useEffect(() => {
    if (summaryImages.length < 2 || isSummaryCarouselPaused) return;
    const id = window.setInterval(() => {
      setSummaryImageIndex((idx) =>
        idx === summaryImages.length - 1 ? 0 : idx + 1,
      );
    }, 4200);
    return () => window.clearInterval(id);
  }, [summaryImages.length, isSummaryCarouselPaused]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Step indicator only (back is handled by the parent sticky nav) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        {/* Step progress */}
        {step !== "result" && (
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const active = s === step;
              const done = i < currentStepIdx;
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-ocean-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`hidden sm:block text-xs font-medium ${
                        active
                          ? "text-gray-900"
                          : done
                            ? "text-emerald-600"
                            : "text-gray-400"
                      }`}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-12 h-0.5 rounded-full ${i < currentStepIdx ? "bg-emerald-400" : "bg-gray-200"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT: Booking summary sidebar ───────────────────────────────── */}
        <div className="order-2 lg:order-1 lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
            {/* Marina hero */}
            <div
              className="relative h-36"
              onMouseEnter={() => setIsSummaryCarouselPaused(true)}
              onMouseLeave={() => setIsSummaryCarouselPaused(false)}
            >
              {summaryImage ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`summary-image-${summaryImageIndex}`}
                    src={summaryImage}
                    alt={marina.name}
                    initial={{ opacity: 0.25, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.25, scale: 1.02 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-ocean-800" />
              )}

              {summaryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSummaryImageIndex((idx) =>
                        idx === 0 ? summaryImages.length - 1 : idx - 1,
                      )
                    }
                    className="absolute top-2 right-9 z-20 h-6 w-6 rounded-full bg-black/30 text-white hover:bg-black/45 flex items-center justify-center"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSummaryImageIndex((idx) =>
                        idx === summaryImages.length - 1 ? 0 : idx + 1,
                      )
                    }
                    className="absolute top-2 right-2 z-20 h-6 w-6 rounded-full bg-black/30 text-white hover:bg-black/45 flex items-center justify-center"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1">
                    {summaryImages.slice(0, 5).map((_, idx) => (
                      <button
                        key={`summary-dot-${idx}`}
                        type="button"
                        onClick={() => setSummaryImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === summaryImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/65"}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-900/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="flex items-center gap-1 text-white/70 text-[10px] font-semibold uppercase tracking-wider">
                    {SVC_ICON[serviceType]}
                    {BOOKING_SERVICE_TYPES[serviceType]?.label}
                  </span>
                </div>
                <p className="text-white font-bold text-sm line-clamp-1">
                  {marina.name}
                </p>
                <p className="text-white/55 text-xs">
                  <MapPin className="inline h-3 w-3 mr-0.5" />
                  {marina.city}
                  {marina.state ? `, ${marina.state}` : ""}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Check-in", fmtShort(dateRange.checkIn)],
                  ["Check-out", fmtShort(dateRange.checkOut)],
                ].map(([lbl, val]) => (
                  <div
                    key={lbl}
                    className="rounded-xl bg-gray-50 border border-gray-100 p-3"
                  >
                    <p className="text-gray-400 text-xs mb-0.5">{lbl}</p>
                    <p className="text-gray-900 font-semibold text-sm">{val}</p>
                  </div>
                ))}
              </div>

              {/* Nights */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-600 text-sm">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                </div>
                {slip?.slipNumber && slip.slipNumber !== "N/A" && (
                  <div className="flex items-center gap-1.5">
                    <Anchor className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      Slip {slip.slipNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Selected boat — appears after step 1 */}
              <AnimatePresence>
                {selectedBoat && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-ocean-50 border border-ocean-200 p-3"
                  >
                    <div className="h-9 w-9 rounded-lg bg-ocean-100 flex items-center justify-center shrink-0">
                      <Ship className="h-4 w-4 text-ocean-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ocean-800 font-semibold text-sm truncate">
                        {selectedBoat.boat_name}
                      </p>
                      <p className="text-ocean-600 text-xs truncate">
                        {selectedBoat.boat_type}
                      </p>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Price breakdown */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    ${unitPrice.toFixed(2)} × {nights} nights
                  </span>
                  <span>${(totalCost - serviceFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service fee (10%)</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {(
                  [
                    [Shield, "Secure payment via DockNow secure checkout"],
                    [Star, "Free cancellation up to 48h before"],
                    [Sparkles, "Instant booking confirmation"],
                  ] as const
                ).map(([Icon, text]) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    <span className="text-gray-400 text-xs">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: booking steps form ────────────────────────────────────── */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* ════════════════ STEP 1: Boat ════════════════ */}
            {step === "boat" && (
              <motion.div
                key="boat"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Select your vessel
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {serviceType === "slip"
                      ? "Only vessels that fit the slip dimensions are shown."
                      : "Choose the vessel you'll be bringing."}
                  </p>
                </div>

                {/* Existing boats */}
                {boats.length > 0 && (
                  <div className="space-y-3">
                    {boats.map((boat) => {
                      const fits = boatFits(boat);
                      const selected = selectedBoat?.id === boat.id;
                      return (
                        <motion.button
                          key={boat.id}
                          type="button"
                          onClick={() => {
                            if (!fits) return;
                            dispatch(clearError());
                            dispatch(setSelectedBoat(boat));
                          }}
                          disabled={!fits}
                          whileHover={fits ? { scale: 1.005 } : {}}
                          whileTap={fits ? { scale: 0.997 } : {}}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                            selected
                              ? "border-ocean-500 bg-ocean-50 shadow-sm"
                              : fits
                                ? "border-gray-200 bg-white hover:border-ocean-300 hover:bg-ocean-50/30"
                                : "border-red-100 bg-red-50/20 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-ocean-600" : "bg-gray-100"}`}
                            >
                              <Ship
                                className={`h-6 w-6 ${selected ? "text-white" : "text-gray-500"}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-semibold ${selected ? "text-ocean-700" : "text-gray-900"}`}
                              >
                                {boat.boat_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {boat.boat_type}
                                {boat.manufacturer
                                  ? ` · ${boat.manufacturer}`
                                  : ""}
                                {boat.model ? ` ${boat.model}` : ""}
                                {boat.year ? ` (${boat.year})` : ""}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {boat.length_meters}m × {boat.width_meters}m ·{" "}
                                {boat.draft_meters}m draft
                              </p>
                            </div>
                            {!fits ? (
                              <Badge className="bg-red-100 text-red-600 border-0 shrink-0">
                                Too large
                              </Badge>
                            ) : selected ? (
                              <div className="h-8 w-8 rounded-full bg-ocean-600 flex items-center justify-center shrink-0">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            ) : null}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Add boat form */}
                {showAddBoat ? (
                  <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAddBoat}
                    className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-6"
                  >
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Add a new vessel
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Vessel name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newBoat.boat_name}
                          onChange={(e) =>
                            setNewBoat({
                              ...newBoat,
                              boat_name: e.target.value,
                            })
                          }
                          placeholder="e.g., Sea Explorer"
                          required
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Vessel type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={newBoat.boat_type_id}
                          onValueChange={(v) =>
                            setNewBoat({ ...newBoat, boat_type_id: v })
                          }
                          required
                        >
                          <SelectTrigger className="rounded-xl border-gray-200">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {boatTypes.map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Year
                        </Label>
                        <Input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={newBoat.year}
                          onChange={(e) =>
                            setNewBoat({ ...newBoat, year: e.target.value })
                          }
                          placeholder="e.g., 2020"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Manufacturer
                        </Label>
                        <Input
                          value={newBoat.manufacturer}
                          onChange={(e) =>
                            setNewBoat({
                              ...newBoat,
                              manufacturer: e.target.value,
                            })
                          }
                          placeholder="e.g., Beneteau"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          Model
                        </Label>
                        <Input
                          value={newBoat.model}
                          onChange={(e) =>
                            setNewBoat({ ...newBoat, model: e.target.value })
                          }
                          placeholder="e.g., Oceanis 46"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                        Dimensions (meters){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          ["Length", "length_meters", "15.0"],
                          ["Width", "width_meters", "4.5"],
                          ["Draft", "draft_meters", "2.0"],
                        ].map(([lbl, key, ph]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500 mb-1">{lbl}</p>
                            <Input
                              type="number"
                              step="0.1"
                              value={(newBoat as any)[key]}
                              onChange={(e) =>
                                setNewBoat({
                                  ...newBoat,
                                  [key]: e.target.value,
                                })
                              }
                              placeholder={ph}
                              required
                              className="rounded-xl border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photo */}
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                        Photo (optional)
                      </Label>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setBoatPhotoFile(f);
                          try {
                            setBoatPhotoPreview(await createImagePreviewUrl(f));
                          } catch {}
                        }}
                      />
                      {boatPhotoPreview ? (
                        <div className="relative h-32 rounded-xl overflow-hidden">
                          <img
                            src={boatPhotoPreview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setBoatPhotoFile(null);
                              setBoatPhotoPreview(null);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-ocean-400 hover:bg-ocean-50/30 hover:text-ocean-600 transition-colors"
                        >
                          <Camera className="h-4 w-4" /> Upload vessel photo
                        </button>
                      )}
                    </div>

                    {/* Optional details */}
                    <Collapsible
                      open={showOptional}
                      onOpenChange={setShowOptional}
                    >
                      <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${showOptional ? "rotate-180" : ""}`}
                        />
                        {showOptional ? "Hide" : "Show"} optional details
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          [
                            "Home marina",
                            "home_marina",
                            "e.g., San Diego Bay Marina",
                          ],
                          [
                            "Registration number",
                            "registration_number",
                            "e.g., CA1234AB",
                          ],
                          [
                            "Insurance provider",
                            "insurance_provider",
                            "e.g., BoatUS",
                          ],
                          [
                            "Insurance policy #",
                            "insurance_policy_number",
                            "e.g., POL-123456",
                          ],
                        ].map(([lbl, key, ph]) => (
                          <Input
                            key={key}
                            placeholder={`${lbl} — ${ph}`}
                            value={(newBoat as any)[key]}
                            onChange={(e) =>
                              setNewBoat({ ...newBoat, [key]: e.target.value })
                            }
                            className="rounded-xl border-gray-200"
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isLoading || boatPhotoUploading}
                        className="flex-1 h-12 rounded-xl bg-ocean-600 text-white text-sm font-semibold transition hover:bg-ocean-700 disabled:opacity-40"
                      >
                        {isLoading || boatPhotoUploading
                          ? "Adding…"
                          : "Add vessel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddBoat(false);
                          setShowOptional(false);
                        }}
                        className="h-12 px-6 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddBoat(true)}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 transition hover:border-ocean-400 hover:bg-ocean-50/30 hover:text-ocean-700"
                  >
                    <Plus className="h-4 w-4" /> Add a new vessel
                  </button>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex h-12 items-center gap-1.5 px-5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedBoat) return;
                      dispatch(clearError());
                      setStep(
                        preCheckoutSteps.length > 0
                          ? "pre-checkout"
                          : "payment",
                      );
                    }}
                    disabled={!selectedBoat}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 text-white font-semibold text-sm transition hover:from-ocean-700 hover:to-ocean-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-ocean-600/20 flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════ STEP 2: Pre-checkout ════════════════ */}
            {step === "pre-checkout" && (
              <motion.div
                key="pre-checkout"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Before you arrive
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    The marina requires the following information.
                  </p>
                </div>

                <div className="space-y-4">
                  {preCheckoutSteps.map((s: any) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {s.title}
                          </h4>
                          {s.description && (
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                              {s.description}
                            </p>
                          )}
                        </div>
                        {s.is_required && (
                          <Badge className="bg-ocean-50 text-ocean-700 border-ocean-200 shrink-0">
                            Required
                          </Badge>
                        )}
                      </div>

                      {s.fields?.length > 0 ? (
                        <div className="space-y-4">
                          {s.fields.map((field: any) => (
                            <div key={field.id}>
                              <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                                {field.field_label}
                                {field.is_required && (
                                  <span className="text-red-500 text-xs">
                                    *
                                  </span>
                                )}
                              </Label>
                              {field.field_type === "text" && (
                                <Input
                                  value={
                                    typeof preCheckoutResponses[field.id] ===
                                    "string"
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
                                  className="rounded-xl border-gray-200"
                                />
                              )}
                              {field.field_type === "textarea" && (
                                <Textarea
                                  rows={4}
                                  value={
                                    typeof preCheckoutResponses[field.id] ===
                                    "string"
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
                                  className="resize-none rounded-xl border-gray-200"
                                />
                              )}
                              {(field.field_type === "file" ||
                                field.field_type === "multiple_files") && (
                                <div className="space-y-3">
                                  <Input
                                    type="file"
                                    multiple={
                                      field.field_type === "multiple_files"
                                    }
                                    accept={field.file_types_allowed
                                      ?.split(",")
                                      .map((x: string) => `.${x}`)
                                      .join(",")}
                                    onChange={(e) =>
                                      handleFileUpload(
                                        field.id,
                                        field,
                                        e.target.files,
                                      )
                                    }
                                    className="rounded-xl border-gray-200"
                                  />
                                  {fileUploads[field.id]?.uploading && (
                                    <div className="flex items-center gap-2 text-sm text-ocean-600">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Uploading…
                                    </div>
                                  )}
                                  {(fileUploads[field.id]?.files ?? []).length >
                                    0 && (
                                    <div className="space-y-2">
                                      {fileUploads[field.id].files.map(
                                        (uf: any) => (
                                          <div
                                            key={uf.upload_id}
                                            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                                          >
                                            <div className="shrink-0">
                                              {isImageFile(uf.original_name) &&
                                              filePreviews[
                                                `${field.id}_${uf.original_name}`
                                              ] ? (
                                                <img
                                                  src={
                                                    filePreviews[
                                                      `${field.id}_${uf.original_name}`
                                                    ]
                                                  }
                                                  alt=""
                                                  className="h-10 w-10 rounded object-cover"
                                                />
                                              ) : isImageFile(
                                                  uf.original_name,
                                                ) ? (
                                                <Image className="h-6 w-6 text-emerald-600" />
                                              ) : (
                                                <File className="h-6 w-6 text-emerald-600" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate">
                                                {uf.original_name}
                                              </p>
                                              {uf.size && (
                                                <p className="text-xs text-gray-400">
                                                  {formatFileSize(uf.size)}
                                                </p>
                                              )}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                dispatch(
                                                  removeUploadedFile({
                                                    fieldId: field.id,
                                                    uploadId: uf.upload_id,
                                                  }),
                                                )
                                              }
                                              className="text-red-400 hover:text-red-600 transition p-1 rounded"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {field.field_type === "select" &&
                                field.options && (
                                  <Select
                                    value={
                                      typeof preCheckoutResponses[field.id] ===
                                      "string"
                                        ? (preCheckoutResponses[
                                            field.id
                                          ] as string)
                                        : ""
                                    }
                                    onValueChange={(v) =>
                                      dispatch(
                                        setPreCheckoutResponse({
                                          stepId: field.id,
                                          response: v,
                                        }),
                                      )
                                    }
                                  >
                                    <SelectTrigger className="rounded-xl border-gray-200">
                                      <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options.map((o: string) => (
                                        <SelectItem key={o} value={o}>
                                          {o}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Textarea
                          rows={4}
                          value={
                            typeof preCheckoutResponses[s.id] === "string"
                              ? (preCheckoutResponses[s.id] as string)
                              : ""
                          }
                          onChange={(e) =>
                            dispatch(
                              setPreCheckoutResponse({
                                stepId: s.id,
                                response: e.target.value,
                              }),
                            )
                          }
                          placeholder="Type your response here…"
                          className="resize-none rounded-xl border-gray-200"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {(error || validationError) && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {validationError || error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("boat");
                      setValidationError(null);
                    }}
                    className="flex h-12 items-center gap-1.5 px-5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!preCheckoutComplete()) {
                        setValidationError(
                          "Please fill in all required fields.",
                        );
                        return;
                      }
                      setValidationError(null);
                      dispatch(clearError());
                      setStep("payment");
                    }}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 text-white font-semibold text-sm transition hover:from-ocean-700 hover:to-ocean-800 shadow-md shadow-ocean-600/20 flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════ STEP 3: Payment ════════════════ */}
            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Complete your payment
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Your card will be charged once you confirm.
                  </p>
                </div>

                {/* Recap for mobile */}
                <div className="lg:hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-xs">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {fmtDate(dateRange.checkIn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {fmtDate(dateRange.checkOut)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                    <span>Total</span>
                    <span>${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {!paymentClientSecret ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-ocean-50 flex items-center justify-center">
                      <CreditCard className="h-8 w-8 text-ocean-600" />
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      {paymentMethods.length > 0
                        ? "Select a saved payment method"
                        : "Add a payment method to continue"}
                    </p>
                    <p className="text-gray-400 text-xs mb-6">
                      You'll be charged ${totalCost.toFixed(2)} for {nights}{" "}
                      night{nights !== 1 ? "s" : ""}
                    </p>

                    {paymentMethods.length > 0 ? (
                      <div className="space-y-4 text-left max-w-xl mx-auto">
                        <div className="space-y-2">
                          {paymentMethods.map((pm) => (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() =>
                                setSelectedSavedPaymentMethodId(pm.id)
                              }
                              className={`w-full rounded-xl border px-4 py-3 flex items-center justify-between transition ${selectedSavedPaymentMethodId === pm.id ? "border-ocean-500 bg-ocean-50" : "border-gray-200 bg-white hover:border-ocean-300"}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 capitalize">
                                    {pm.brand} •••• {pm.last4}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Expires {pm.expMonth}/{pm.expYear}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {pm.isDefault && (
                                  <Badge className="bg-gray-100 text-gray-700 border-0">
                                    Default
                                  </Badge>
                                )}
                                {selectedSavedPaymentMethodId === pm.id && (
                                  <Check className="h-4 w-4 text-ocean-600" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-3 justify-center">
                          <button
                            type="button"
                            disabled={
                              isLoading || !selectedSavedPaymentMethodId
                            }
                            onClick={async () => {
                              if (
                                !selectedBoat ||
                                !currentUser ||
                                !selectedSavedPaymentMethodId
                              )
                                return;
                              try {
                                logger.info(
                                  "[BookingFlow] createPaymentIntent:start",
                                  {
                                    marinaId: marina.id,
                                    boatId: selectedBoat.id,
                                    serviceType,
                                    slipId:
                                      serviceType === "slip" && slip?.id
                                        ? slip.id
                                        : null,
                                    paymentMethodId:
                                      selectedSavedPaymentMethodId,
                                    checkIn: dateRange.checkIn,
                                    checkOut: dateRange.checkOut,
                                  },
                                );
                                const result = await dispatch(
                                  createPaymentIntent({
                                    userId: currentUser.id,
                                    marinaId: marina.id,
                                    boatId: selectedBoat.id,
                                    slipId:
                                      serviceType === "slip" && slip?.id
                                        ? slip.id
                                        : undefined,
                                    paymentMethodId:
                                      selectedSavedPaymentMethodId,
                                    checkIn: dateRange.checkIn!,
                                    checkOut: dateRange.checkOut!,
                                    specialRequests:
                                      Object.entries(preCheckoutResponses)
                                        .length > 0
                                        ? Object.entries(preCheckoutResponses)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join("; ")
                                        : undefined,
                                    serviceType,
                                  }),
                                );

                                if (
                                  !createPaymentIntent.fulfilled.match(result)
                                ) {
                                  logger.error(
                                    "[BookingFlow] createPaymentIntent:failed",
                                    {
                                      error: (result as any)?.payload,
                                    },
                                  );
                                  return;
                                }

                                const clientSecret =
                                  result.payload.clientSecret;
                                logger.info(
                                  "[BookingFlow] createPaymentIntent:success",
                                  {
                                    bookingId: result.payload.bookingId,
                                    hasClientSecret: Boolean(clientSecret),
                                  },
                                );
                                const stripeClient = await stripePromise;
                                if (!stripeClient) {
                                  dispatch(
                                    setPaymentError(
                                      "Stripe is not available. Please refresh and try again.",
                                    ),
                                  );
                                  return;
                                }

                                dispatch(setPaymentStatus("processing"));
                                logger.info(
                                  "[BookingFlow] confirmCardPayment:start",
                                  {
                                    bookingId: result.payload.bookingId,
                                    paymentMethodId:
                                      selectedSavedPaymentMethodId,
                                  },
                                );
                                const { error, paymentIntent } =
                                  await stripeClient.confirmCardPayment(
                                    clientSecret,
                                    {
                                      payment_method:
                                        selectedSavedPaymentMethodId,
                                    },
                                  );

                                if (error) {
                                  logger.error(
                                    "[BookingFlow] confirmCardPayment:error",
                                    {
                                      message: error.message,
                                      code: (error as any)?.code,
                                    },
                                  );
                                  dispatch(
                                    setPaymentError(
                                      error.message || "Payment failed",
                                    ),
                                  );
                                  return;
                                }

                                if (paymentIntent?.status === "succeeded") {
                                  logger.info(
                                    "[BookingFlow] confirmCardPayment:succeeded",
                                    {
                                      paymentIntentId: paymentIntent.id,
                                      status: paymentIntent.status,
                                    },
                                  );
                                  await handlePaymentSuccess(
                                    paymentIntent.id,
                                    result.payload.bookingId,
                                  );
                                } else {
                                  logger.warn(
                                    "[BookingFlow] confirmCardPayment:non-success",
                                    {
                                      paymentIntentId: paymentIntent?.id,
                                      status: paymentIntent?.status,
                                    },
                                  );
                                  dispatch(
                                    setPaymentError(
                                      "Payment requires additional action. Please try again.",
                                    ),
                                  );
                                }
                              } catch (err: any) {
                                logger.error(
                                  "[BookingFlow] confirmCardPayment:throw",
                                  {
                                    message: err?.message,
                                  },
                                );
                                dispatch(
                                  setPaymentError(
                                    err?.message ||
                                      "Unexpected payment error. Please try again.",
                                  ),
                                );
                              }
                            }}
                            className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 px-8 text-white font-semibold text-sm transition hover:from-ocean-700 hover:to-ocean-800 disabled:opacity-40 shadow-md shadow-ocean-600/20"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing…
                              </>
                            ) : (
                              <>
                                Pay with selected method
                                <ChevronRight className="h-4 w-4" />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => dispatch(createSetupIntent())}
                            className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-200 px-6 text-gray-700 font-semibold text-sm transition hover:bg-gray-50 disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" /> Add new card
                          </button>
                        </div>
                      </div>
                    ) : setupIntentClientSecret ? (
                      <div className="max-w-xl mx-auto text-left">
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: setupIntentClientSecret,
                            appearance: {
                              theme: "stripe",
                              variables: {
                                colorPrimary: "#0369a1",
                                borderRadius: "8px",
                              },
                            },
                          }}
                        >
                          <SetupPaymentMethodForm
                            onSuccess={() => {
                              dispatch(clearSetupIntentClientSecret());
                              dispatch(fetchSavedPaymentMethods());
                            }}
                            onError={(e) => dispatch(setPaymentError(e))}
                            onProcessing={(p) =>
                              dispatch(
                                setPaymentStatus(p ? "processing" : "idle"),
                              )
                            }
                          />
                        </Elements>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => dispatch(createSetupIntent())}
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 px-10 text-white font-semibold text-sm transition hover:from-ocean-700 hover:to-ocean-800 disabled:opacity-40 shadow-md shadow-ocean-600/20"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Preparing…
                          </>
                        ) : (
                          <>
                            Add payment method
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
                    {paymentStatus === "processing" && (
                      <div className="rounded-xl border border-ocean-200 bg-ocean-50 py-4 text-center">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-ocean-600" />
                        <p className="text-sm font-medium text-gray-900">
                          Processing payment…
                        </p>
                      </div>
                    )}
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: paymentClientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#0369a1",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    >
                      <StripeForm
                        totalCost={totalCost}
                        onSuccess={handlePaymentSuccess}
                        onError={(e) => dispatch(setPaymentError(e))}
                        onProcessing={(p) =>
                          dispatch(setPaymentStatus(p ? "processing" : "idle"))
                        }
                      />
                    </Elements>
                  </div>
                )}

                {(error || paymentError) && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {paymentError || error}
                  </div>
                )}

                <button
                  type="button"
                  disabled={paymentStatus === "processing"}
                  onClick={() =>
                    setStep(
                      preCheckoutSteps.length > 0 ? "pre-checkout" : "boat",
                    )
                  }
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              </motion.div>
            )}

            {/* ════════════════ STEP 4: Result ════════════════ */}
            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {paymentStatus === "succeeded" && (
                  <>
                    <Confetti
                      width={window.innerWidth}
                      height={window.innerHeight}
                      recycle={false}
                      numberOfPieces={220}
                      gravity={0.08}
                    />
                    <div className="py-12 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="mx-auto mb-6 h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center"
                      >
                        <CheckCircle
                          className="h-13 w-13 text-emerald-600"
                          style={{ height: 52, width: 52 }}
                        />
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                      >
                        Booking confirmed!
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-gray-500 mb-8 max-w-sm mx-auto"
                      >
                        Your reservation is confirmed. A confirmation email is
                        on its way.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left mb-8"
                      >
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Booking summary
                        </h4>
                        <div className="space-y-2.5 text-sm">
                          {[
                            ["Booking ID", `#${bookingId}`],
                            ["Marina", marina.name],
                            ...(slip?.slipNumber && slip.slipNumber !== "N/A"
                              ? [["Slip", slip.slipNumber]]
                              : []),
                            ["Check-in", fmtDate(dateRange.checkIn)],
                            ["Check-out", fmtDate(dateRange.checkOut)],
                            [
                              "Duration",
                              `${nights} night${nights !== 1 ? "s" : ""}`,
                            ],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-medium text-gray-900">
                                {value}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-200 text-base">
                            <span>Total paid</span>
                            <span className="text-emerald-600">
                              ${totalCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="flex justify-center gap-3"
                      >
                        <button
                          type="button"
                          onClick={onBack}
                          className="h-12 px-8 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Back to marina
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.location.assign("/reservations")
                          }
                          className="h-12 px-8 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 text-white font-semibold text-sm transition hover:from-ocean-700 hover:to-ocean-800 shadow-md"
                        >
                          View reservations
                        </button>
                      </motion.div>
                    </div>
                  </>
                )}

                {paymentStatus === "failed" && (
                  <div className="py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="mx-auto mb-6 h-24 w-24 rounded-full bg-red-100 flex items-center justify-center"
                    >
                      <XCircle
                        className="text-red-600"
                        style={{ height: 52, width: 52 }}
                      />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Payment failed
                    </h2>
                    <p className="text-gray-500 mb-6">
                      We couldn't process your payment.
                    </p>
                    {paymentError && (
                      <div className="mx-auto max-w-sm rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
                        <p className="text-sm text-red-700">{paymentError}</p>
                      </div>
                    )}
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="h-12 px-6 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
