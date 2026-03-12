/**
 * MarinaDetail – Airbnb / Turo-inspired redesign
 * Flow: service type → calendar (live slip counts) → slip/price → Reserve
 *       → BookingFlow (boat → pre-checkout → payment → confirmation)
 */

import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MetaHelmet from "@/components/MetaHelmet";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Anchor,
  Wifi,
  Car,
  Zap,
  Fuel,
  Waves,
  Phone,
  Mail,
  Globe2,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Award,
  Info,
  Layers,
  Wrench,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Ruler,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BookingCalendar from "@/components/BookingCalendar";
import SignInModal from "@/components/SignInModal";
import BookingFlow from "@/components/BookingFlow";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMarinaDetail,
  fetchMarinaAvailability,
  setSelectedDateRange,
  setSelectedSlip,
  clearMarinaDetail,
} from "@/store/slices/marinaDetailSlice";
import {
  selectMarinaDetail,
  selectIsLoadingAnyDetail,
  selectSelectedDateRange,
  selectSelectedSlip,
  selectMarinaAvailability,
  selectAvailableSlips,
  selectBookingDuration,
} from "@/store/selectors/marinaDetailSelectors";
import { checkAuthStatus } from "@/store/slices/authSlice";
import {
  BookingServiceType,
  BOOKING_SERVICE_TYPES,
  MarinaServiceTypePricing,
} from "@shared/api";

// ─── Local types ──────────────────────────────────────────────────────────────

interface AvailableSlip {
  id: number;
  slipNumber: string;
  length: number;
  width: number;
  depth: number;
  pricePerDay: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toNullableNum = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const SVC_ICON: Record<BookingServiceType, React.ElementType> = {
  slip: Anchor,
  dry_stack: Layers,
  shipyard_maintenance: Wrench,
};

const AMENITY_ICONS: Record<string, React.ElementType> = {
  "Wi-Fi": Wifi,
  WiFi: Wifi,
  Internet: Wifi,
  Parking: Car,
  Electricity: Zap,
  Power: Zap,
  Fuel: Fuel,
  Gas: Fuel,
  Restrooms: Users,
  Showers: Users,
  Laundry: Users,
  Security: Shield,
  "Marina Store": Anchor,
  Shorepower: Zap,
  Water: Waves,
};

// ─── Fallback images ──────────────────────────────────────────────────────────

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80",
];

// ─── Component ────────────────────────────────────────────────────────────────

const MarinaDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ── Redux state ──────────────────────────────────────────────────────────
  const marina = useAppSelector(selectMarinaDetail);
  const loading = useAppSelector(selectIsLoadingAnyDetail);
  const selectedDateRange = useAppSelector(selectSelectedDateRange);
  const selectedSlip = useAppSelector(selectSelectedSlip);
  const availability = useAppSelector(selectMarinaAvailability);
  const availableSlips = useAppSelector(selectAvailableSlips);
  const bookingDuration = useAppSelector(selectBookingDuration);
  const authUser = useAppSelector((s) => s.auth.user);
  const isCheckingAuth = useAppSelector((s) => s.auth.isLoading);

  // ── Local state ──────────────────────────────────────────────────────────
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedServiceType, setSelectedServiceType] =
    useState<BookingServiceType | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (slug) dispatch(fetchMarinaDetail(slug));
    return () => {
      dispatch(clearMarinaDetail());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (!marina?.id) return;
    if (selectedDateRange.checkIn && selectedDateRange.checkOut) {
      dispatch(
        fetchMarinaAvailability({
          marinaId: marina.id,
          checkIn: selectedDateRange.checkIn.split("T")[0],
          checkOut: selectedDateRange.checkOut.split("T")[0],
        }),
      );
    } else if (!selectedDateRange.checkIn && !selectedDateRange.checkOut) {
      dispatch(fetchMarinaAvailability({ marinaId: marina.id }));
    }
  }, [
    marina?.id,
    selectedDateRange.checkIn,
    selectedDateRange.checkOut,
    dispatch,
  ]);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDateSelect = (dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  }) => {
    dispatch(
      setSelectedDateRange({
        checkIn: dates.checkIn ? dates.checkIn.toISOString() : null,
        checkOut: dates.checkOut ? dates.checkOut.toISOString() : null,
      }),
    );
  };

  const handleSlipSelect = (slip: AvailableSlip | null) => {
    dispatch(setSelectedSlip(slip?.id || null));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: marina?.name,
        text: `Check out ${marina?.name} on DockNow`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const canStartBookingFlow =
    selectedServiceType !== null &&
    selectedDateRange.checkIn !== null &&
    selectedDateRange.checkOut !== null &&
    (selectedServiceType !== "slip" || selectedSlip !== null);

  const exitBookingFlow = () => {
    setShowBookingFlow(false);
  };

  const handleReserveClick = () => {
    if (!canStartBookingFlow) return;
    if (!authUser) setShowSignInModal(true);
    else setShowBookingFlow(true);
  };

  const handleAuthSuccess = () => {
    // Ignore stale onSuccess emissions when modal isn't actively open.
    if (!showSignInModal) return;
    setShowSignInModal(false);
    if (canStartBookingFlow) {
      setShowBookingFlow(true);
    }
  };

  useEffect(() => {
    // Safety net: if hot-reload or state drift opens flow without required
    // selections, force it closed so user can pick dates/slip first.
    if (showBookingFlow && !canStartBookingFlow) {
      setShowBookingFlow(false);
    }
  }, [showBookingFlow, canStartBookingFlow]);

  const handleServiceTypeChange = (key: BookingServiceType) => {
    if (selectedServiceType !== key) {
      dispatch(setSelectedDateRange({ checkIn: null, checkOut: null }));
      dispatch(setSelectedSlip(null));
    }
    setSelectedServiceType(key);
  };

  // ── Loading / not-found states ────────────────────────────────────────────
  // Show spinner when loading OR when marina hasn't loaded yet (initial render
  // where Redux default state has loading=false but marina=null)
  if (!marina) {
    // If loading is active OR we just haven't gotten data yet, show spinner
    if (loading || !slug) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-ocean-100 border-t-ocean-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-500 text-sm font-medium">
              Loading marina details…
            </p>
          </motion.div>
        </div>
      );
    }
    // Loading finished but no marina — not found
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <Anchor className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Marina not found
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            This marina doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="px-6 py-3 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-sm transition-colors"
          >
            Browse Marinas
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const marinaImages =
    marina?.images && marina.images.length > 0
      ? marina.images.map((img: any) =>
          typeof img === "string" ? img : img.url,
        )
      : FALLBACK_IMAGES;

  const serviceTypePricing: MarinaServiceTypePricing[] =
    (marina as any)?.serviceTypePricing || [];

  const activePricing = serviceTypePricing.find(
    (p) => p.service_type === selectedServiceType,
  );

  const requiresSlipSelection = selectedServiceType === "slip";

  const selectedSlipDetails = selectedSlip
    ? (availableSlips.find((s) => s.id === selectedSlip) ?? null)
    : null;

  const minSlipPrice =
    availableSlips.length > 0
      ? Math.min(...availableSlips.map((s) => s.pricePerDay))
      : null;

  const pricePerDayForService = toNum(
    selectedServiceType === "slip"
      ? (selectedSlipDetails?.pricePerDay ?? marina.price_per_day ?? 0)
      : (activePricing?.price_per_day ?? marina.price_per_day ?? 0),
  );

  const totalCost =
    bookingDuration > 0 &&
    (requiresSlipSelection ? !!selectedSlipDetails : true)
      ? pricePerDayForService * bookingDuration
      : 0;

  const serviceFee = totalCost * 0.1;
  const finalTotal = totalCost + serviceFee;

  const canReserve =
    selectedServiceType !== null &&
    bookingDuration > 0 &&
    (requiresSlipSelection ? !!selectedSlipDetails : true);

  // Base display price (before any selection)
  const basePriceDisplay = (() => {
    const prices = serviceTypePricing
      .filter((p) => p.is_available)
      .map((p) => toNum(p.price_per_day));
    if (minSlipPrice != null) prices.push(minSlipPrice);
    if (marina.price_per_day) prices.push(toNum(marina.price_per_day));
    return prices.filter((p) => p > 0).length > 0
      ? Math.min(...prices.filter((p) => p > 0))
      : 0;
  })();

  const amenityList: string[] = (() => {
    if (!marina.amenities || !Array.isArray(marina.amenities)) return [];
    return marina.amenities.map((a: any) => {
      if (typeof a === "string") return a;
      if (typeof a === "object" && a.name) return a.name;
      return String(a);
    });
  })();

  const displayedAmenities = showAllAmenities
    ? amenityList
    : amenityList.slice(0, 10);

  const locationCity =
    marina.city || (marina as any)?.location?.city || "Unknown city";
  const locationState = marina.state || (marina as any)?.location?.state || "";
  const locationCountry =
    marina.country || (marina as any)?.location?.country || "";
  const locationSecondary = locationState || locationCountry;

  const totalSlipsDisplay =
    toNum(marina.total_slips) ||
    toNum((marina as any)?.capacity?.totalSlips) ||
    0;
  const availableSlipsDisplay =
    toNum(marina.available_slips) ||
    toNum((marina as any)?.capacity?.availableSlips) ||
    0;

  const locationSummary = locationSecondary
    ? `${locationCity}, ${locationSecondary}`
    : locationCity;

  // Coordinates can come either from top-level fields or nested location object.
  const mapLatitude =
    toNullableNum(marina.latitude) ??
    toNullableNum((marina as any)?.location?.coordinates?.latitude);
  const mapLongitude =
    toNullableNum(marina.longitude) ??
    toNullableNum((marina as any)?.location?.coordinates?.longitude);
  const hasMapCoordinates = mapLatitude !== null && mapLongitude !== null;

  const isDirectoryOnly = (marina as any).isDirectoryOnly === true;

  // Guard: only show booking flow if service type is also selected
  const showingFlow = showBookingFlow && selectedServiceType !== null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-0">
      <MetaHelmet
        title={`${marina.name} – ${locationSummary}`}
        description={
          marina.description ||
          `Book at ${marina.name} in ${locationCity}. ${totalSlipsDisplay} slips from $${toNum(marina.price_per_day).toFixed(0)}/night.`
        }
        keywords={`${marina.name}, ${locationCity} marina, boat slip, dock rental`}
        image={marinaImages[0]}
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          Sticky top navigation bar
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="DockNow home">
              <img
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="DockNow"
                className="h-8 w-auto object-contain invert"
              />
            </Link>

            <button
              onClick={() => (showingFlow ? exitBookingFlow() : navigate(-1))}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-ocean-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showingFlow ? `Back to ${marina.name}` : "Back"}
              </span>
            </button>
          </div>

          {!showingFlow && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline underline hover:no-underline">
                  Share
                </span>
              </button>
              <button
                onClick={() => setIsLiked((l) => !l)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
                <span className="hidden sm:inline underline hover:no-underline">
                  Save
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Inline Booking Flow (full-page takeover)
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {showingFlow && selectedServiceType && (
          <motion.div
            key="booking-flow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22 }}
          >
            <BookingFlow
              marina={marina}
              slip={
                requiresSlipSelection && selectedSlipDetails
                  ? selectedSlipDetails
                  : {
                      id: 0,
                      slipNumber: "N/A",
                      length: 0,
                      width: 0,
                      depth: 0,
                      pricePerDay: pricePerDayForService,
                    }
              }
              dateRange={selectedDateRange}
              serviceType={selectedServiceType}
              totalCost={finalTotal}
              serviceFee={serviceFee}
              user={authUser}
              onBack={() => {
                exitBookingFlow();
                dispatch(setSelectedSlip(null));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          Main page content (hidden when booking flow active)
      ═══════════════════════════════════════════════════════════════════ */}
      {!showingFlow && (
        <>
          {/* ─── Hero Photo Grid ──────────────────────────────────────── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[480px] rounded-2xl overflow-hidden shadow-xl">
              {/* Large main image */}
              <div
                className="col-span-4 sm:col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
                onClick={() => {
                  setCurrentImageIndex(0);
                  setShowImageGallery(true);
                }}
              >
                <img
                  src={marinaImages[0]}
                  alt={marina.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>

              {/* 4 smaller images */}
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="hidden sm:block relative cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setCurrentImageIndex(idx);
                    setShowImageGallery(true);
                  }}
                >
                  {marinaImages[idx] ? (
                    <>
                      <img
                        src={marinaImages[idx]}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {idx === 4 && marinaImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="text-white text-center">
                            <Camera className="h-5 w-5 mx-auto mb-1" />
                            <span className="text-xs font-semibold">
                              +{marinaImages.length - 5} more
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowImageGallery(true)}
              className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Show all photos
            </button>
          </div>

          {/* ─── Main 2-column content ────────────────────────────────── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              {/* ══════════════ LEFT column ══════════════ */}
              <div className="lg:col-span-2 space-y-10">
                {/* Title block */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {marina.is_featured && (
                      <Badge className="bg-gradient-to-r from-ocean-500 to-ocean-700 text-white text-xs px-3 py-1">
                        <Award className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                    {(marina as any).business_type_name && (
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-300"
                      >
                        {(marina as any).business_type_name}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                    {marina.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    {marina.avg_rating && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {Number(marina.avg_rating).toFixed(1)}
                        <span className="font-normal text-gray-400 ml-0.5">
                          ({marina.review_count} reviews)
                        </span>
                      </span>
                    )}
                    {marina.avg_rating && (
                      <span className="text-gray-300">·</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-ocean-600" />
                      {locationSummary}
                      {hasMapCoordinates && (
                        <span className="text-gray-400">
                          ({mapLatitude!.toFixed(4)}, {mapLongitude!.toFixed(4)}
                          )
                        </span>
                      )}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1">
                      <Anchor className="h-3.5 w-3.5 text-ocean-600" />
                      {totalSlipsDisplay} slips
                    </span>
                    {availableSlipsDisplay >= 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-emerald-600 font-medium">
                          {availableSlipsDisplay} available
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>

                <Separator />

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    About this marina
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {marina.description}
                  </p>
                </motion.div>

                {/* Services available */}
                {serviceTypePricing.filter((p) => p.is_available).length >
                  0 && (
                  <>
                    <Separator />
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-5">
                        Available services
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {serviceTypePricing
                          .filter((p) => p.is_available)
                          .map((pricing) => {
                            const svcKey =
                              pricing.service_type as BookingServiceType;
                            const svcInfo = BOOKING_SERVICE_TYPES[svcKey];
                            const Icon = SVC_ICON[svcKey];
                            const price = toNum(pricing.price_per_day);
                            return (
                              <div
                                key={svcKey}
                                className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white hover:border-ocean-200 hover:bg-ocean-50/30 transition-colors"
                              >
                                <div className="w-11 h-11 rounded-xl bg-ocean-100 flex items-center justify-center shrink-0">
                                  <Icon className="h-5 w-5 text-ocean-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {svcInfo?.label}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {svcInfo?.description}
                                  </p>
                                  {price > 0 && (
                                    <p className="text-sm font-bold text-ocean-600 mt-1.5">
                                      ${price.toFixed(0)} / night
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  </>
                )}

                {/* Amenities */}
                {amenityList.length > 0 && (
                  <>
                    <Separator />
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-6">
                        What this place offers
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {displayedAmenities.map(
                          (amenity: string, i: number) => {
                            const Icon = AMENITY_ICONS[amenity] || Check;
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-3 py-2"
                              >
                                <Icon className="h-5 w-5 text-gray-600 shrink-0" />
                                <span className="text-sm text-gray-700">
                                  {amenity}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                      {amenityList.length > 10 && (
                        <button
                          onClick={() => setShowAllAmenities((s) => !s)}
                          className="mt-5 flex items-center gap-2 text-sm font-semibold border-2 border-gray-800 rounded-xl px-5 py-2.5 hover:bg-gray-100 transition-colors"
                        >
                          {showAllAmenities ? (
                            <>
                              <ChevronUp className="h-4 w-4" /> Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" /> Show all{" "}
                              {amenityList.length} amenities
                            </>
                          )}
                        </button>
                      )}
                    </motion.div>
                  </>
                )}

                {/* Marina specs */}
                {(marina.max_boat_length_meters ||
                  marina.max_boat_draft_meters) && (
                  <>
                    <Separator />
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-5">
                        Vessel requirements
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {marina.max_boat_length_meters && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <Ruler className="h-6 w-6 text-ocean-600 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                Max length
                              </p>
                              <p className="font-bold text-gray-900 text-lg">
                                {marina.max_boat_length_meters}m
                              </p>
                            </div>
                          </div>
                        )}
                        {marina.max_boat_draft_meters && (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <Waves className="h-6 w-6 text-ocean-600 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                Max draft
                              </p>
                              <p className="font-bold text-gray-900 text-lg">
                                {marina.max_boat_draft_meters}m
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}

                {/* Map */}
                <Separator />
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Where you'll be
                  </h2>
                  {marina.address && (
                    <p className="text-gray-800 font-medium text-sm mb-0.5">
                      {marina.address}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mb-5">
                    {locationCity}
                    {locationState ? `, ${locationState}` : ""}{" "}
                    {marina.postal_code ||
                      (marina as any)?.location?.postalCode ||
                      ""}
                  </p>

                  {hasMapCoordinates ? (
                    <div className="h-72 rounded-2xl overflow-hidden shadow-md border border-gray-100">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLongitude - 0.01},${mapLatitude - 0.01},${mapLongitude + 0.01},${mapLatitude + 0.01}&layer=mapnik&marker=${mapLatitude},${mapLongitude}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        title="Marina location"
                      />
                    </div>
                  ) : (
                    <div className="h-72 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                      <div className="text-center text-gray-400">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Map unavailable</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ══════════════ RIGHT column – Booking widget ══════════════ */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="sticky top-20 space-y-4"
                >
                  {isDirectoryOnly ? (
                    /* ── Directory-only card ── */
                    <div className="border-2 border-amber-200 rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 space-y-4">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Not bookable on DockNow
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            This is a directory listing. Contact the marina
                            directly to reserve.
                          </p>
                        </div>
                      </div>
                      {(marina as any).contact?.phone && (
                        <a
                          href={`tel:${(marina as any).contact.phone}`}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-sm transition-colors"
                        >
                          <Phone className="h-4 w-4" /> Call marina
                        </a>
                      )}
                      {(marina as any).contact?.website && (
                        <a
                          href={(marina as any).contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-ocean-200 text-ocean-600 hover:border-ocean-400 font-semibold text-sm transition-colors"
                        >
                          <Globe2 className="h-4 w-4" /> Visit website
                        </a>
                      )}
                    </div>
                  ) : (
                    /* ── Main booking card ──
                         NOTE: No overflow-hidden — needed so the calendar
                         renders without clipping date tooltips/animations.
                    ── */
                    <div className="border border-gray-200 rounded-2xl shadow-xl bg-white">
                      {/* Price header */}
                      <div className="px-6 pt-6 pb-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {selectedServiceType && pricePerDayForService > 0
                              ? `$${pricePerDayForService.toFixed(0)}`
                              : `from $${basePriceDisplay.toFixed(0)}`}
                          </span>
                          <span className="text-gray-500 text-sm">/ night</span>
                        </div>
                        {marina.avg_rating && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                            <span className="text-sm font-bold text-gray-800">
                              {Number(marina.avg_rating).toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-400">
                              · {marina.review_count} reviews
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Service type selector */}
                      <div className="px-5 py-5">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Service type
                        </p>
                        <div className="space-y-2">
                          {(
                            Object.entries(BOOKING_SERVICE_TYPES) as [
                              BookingServiceType,
                              {
                                label: string;
                                description: string;
                                icon: string;
                              },
                            ][]
                          ).map(([key, info]) => {
                            const pricing = serviceTypePricing.find(
                              (p) => p.service_type === key,
                            );
                            if (
                              serviceTypePricing.length > 0 &&
                              pricing &&
                              !pricing.is_available
                            )
                              return null;
                            if (
                              serviceTypePricing.length > 0 &&
                              !pricing &&
                              key !== "slip"
                            )
                              return null;

                            const Icon = SVC_ICON[key];
                            const displayPrice =
                              key === "slip"
                                ? (minSlipPrice ??
                                  pricing?.price_per_day ??
                                  marina.price_per_day)
                                : (pricing?.price_per_day ??
                                  marina.price_per_day);
                            const priceLabel =
                              key === "slip" && minSlipPrice !== null
                                ? `from $${toNum(displayPrice).toFixed(0)} /night`
                                : `$${toNum(displayPrice).toFixed(0)} /night`;
                            const isSelected = selectedServiceType === key;

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleServiceTypeChange(key)}
                                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 flex items-center gap-3 ${
                                  isSelected
                                    ? "border-gray-900 bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50/50"
                                }`}
                              >
                                <div
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-gray-900 text-white"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {info.label}
                                    </span>
                                    <span className="text-xs font-bold text-gray-600 shrink-0">
                                      {priceLabel}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">
                                    {info.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Calendar — inline, outside any overflow:hidden ancestor */}
                      {selectedServiceType && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Separator />
                          <div className="px-3 py-3">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                              {selectedServiceType === "slip"
                                ? "Select dates & slip"
                                : "Select your dates"}
                            </p>
                            <BookingCalendar
                              marinaId={marina.id}
                              totalSlips={marina.total_slips || 0}
                              availability={availability}
                              selectedDateRange={selectedDateRange}
                              selectedSlip={selectedSlipDetails}
                              pricePerDay={pricePerDayForService}
                              onDateSelect={handleDateSelect}
                              onSlipSelect={handleSlipSelect}
                              showSlipSelection={selectedServiceType === "slip"}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Price breakdown + Reserve CTA */}
                      <AnimatePresence>
                        {canReserve && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Separator />
                            <div className="px-6 py-5 space-y-4">
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>
                                    ${pricePerDayForService.toFixed(2)} ×{" "}
                                    {bookingDuration}{" "}
                                    {bookingDuration === 1 ? "night" : "nights"}
                                  </span>
                                  <span>
                                    $
                                    {(
                                      pricePerDayForService * bookingDuration
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span className="flex items-center gap-1">
                                    Service fee
                                    <Info className="h-3.5 w-3.5 text-gray-400" />
                                  </span>
                                  <span>${serviceFee.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base text-gray-900">
                                  <span>Total</span>
                                  <span>${finalTotal.toFixed(2)}</span>
                                </div>
                              </div>

                              <button
                                onClick={handleReserveClick}
                                disabled={isCheckingAuth}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-bold text-base transition-all duration-200 hover:shadow-lg hover:shadow-ocean-600/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                              >
                                {isCheckingAuth ? "Loading…" : "Reserve"}
                              </button>

                              <p className="text-xs text-center text-gray-500">
                                You won't be charged yet
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Helper prompts */}
                      {!canReserve && selectedServiceType && (
                        <div className="px-6 pb-5">
                          {!bookingDuration && (
                            <p className="text-xs text-center text-gray-500 py-2">
                              Select your dates above to see pricing
                            </p>
                          )}
                          {bookingDuration > 0 &&
                            requiresSlipSelection &&
                            !selectedSlipDetails && (
                              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                                <Info className="h-4 w-4 shrink-0" />
                                Choose an available slip above to continue
                              </div>
                            )}
                        </div>
                      )}

                      {!selectedServiceType && (
                        <div className="px-6 pb-5">
                          <p className="text-xs text-center text-gray-400 py-1">
                            Select a service type above to get started
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trust badges */}
                  <div className="space-y-2 px-1">
                    {(
                      [
                        [Shield, "Payments secured by DockNow Protection"],
                        [Check, "Free cancellation within 48 hours"],
                        [Award, "DockNow verified marina"],
                      ] as [React.ElementType, string][]
                    ).map(([Icon, text]) => (
                      <div
                        key={text}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ─── Mobile sticky bottom bar ─────────────────────────────── */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 safe-area-inset-bottom">
            <div>
              {canReserve ? (
                <>
                  <p className="text-base font-bold text-gray-900">
                    ${finalTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bookingDuration}{" "}
                    {bookingDuration === 1 ? "night" : "nights"}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-gray-700">
                  From ${basePriceDisplay.toFixed(0)} / night
                </p>
              )}
            </div>
            <button
              onClick={canReserve ? handleReserveClick : undefined}
              disabled={!selectedServiceType || isCheckingAuth}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                canReserve
                  ? "bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:from-ocean-700 hover:to-ocean-800 shadow-md shadow-ocean-600/20"
                  : selectedServiceType
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:from-ocean-700 hover:to-ocean-800"
              }`}
            >
              {canReserve
                ? "Reserve"
                : selectedServiceType
                  ? "Select dates"
                  : "Check availability"}
            </button>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Image gallery lightbox
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 text-white">
              <span className="text-sm font-medium text-white/70">
                {currentImageIndex + 1} / {marinaImages.length}
              </span>
              <span className="font-semibold hidden sm:block">
                {marina.name}
              </span>
              <button
                onClick={() => setShowImageGallery(false)}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image area */}
            <div className="flex-1 flex items-center justify-center relative px-16">
              <button
                onClick={() =>
                  setCurrentImageIndex((p) =>
                    p > 0 ? p - 1 : marinaImages.length - 1,
                  )
                }
                className="absolute left-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={marinaImages[currentImageIndex]}
                alt={`${marina.name} – ${currentImageIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain rounded-lg select-none"
              />

              <button
                onClick={() =>
                  setCurrentImageIndex((p) => (p + 1) % marinaImages.length)
                }
                className="absolute right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="px-6 py-4 flex justify-center gap-2 overflow-x-auto">
              {marinaImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`shrink-0 transition-all duration-200 ${
                    i === currentImageIndex
                      ? "ring-2 ring-white opacity-100 scale-105"
                      : "opacity-50 hover:opacity-75"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-16 h-10 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          Sign-in modal
      ═══════════════════════════════════════════════════════════════════ */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default MarinaDetail;
