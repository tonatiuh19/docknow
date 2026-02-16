import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MetaHelmet from "@/components/MetaHelmet";
import {
  ArrowLeft,
  Heart,
  Share,
  Star,
  MapPin,
  Users,
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
  Clock,
  Navigation,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BookingCalendar from "@/components/BookingCalendar";
import SignInModal from "@/components/SignInModal";
import BookingWizard from "@/components/BookingWizard";

// Redux
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

// Types
interface AvailableSlip {
  id: number;
  slipNumber: string;
  length: number;
  width: number;
  depth: number;
  pricePerDay: number;
}

const MarinaDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State selectors
  const marina = useAppSelector(selectMarinaDetail);
  const loading = useAppSelector(selectIsLoadingAnyDetail);
  const selectedDateRange = useAppSelector(selectSelectedDateRange);
  const selectedSlip = useAppSelector(selectSelectedSlip);
  const availability = useAppSelector(selectMarinaAvailability);
  const availableSlips = useAppSelector(selectAvailableSlips);
  const bookingDuration = useAppSelector(selectBookingDuration);

  // Local state
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showBookingWizard, setShowBookingWizard] = useState(false);

  // Get auth state from Redux
  const authUser = useAppSelector((state) => state.auth.user);
  const isCheckingAuth = useAppSelector((state) => state.auth.isLoading);

  // Mock images for showcase
  const marinaImages = [
    marina?.primary_image_url ||
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=1200&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80",
  ];

  // Fetch marina data
  useEffect(() => {
    if (slug) {
      dispatch(fetchMarinaDetail(slug));
    }
    return () => {
      dispatch(clearMarinaDetail());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (marina?.id) {
      dispatch(fetchMarinaAvailability(marina.id));
    }
  }, [marina?.id, dispatch]);

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Handlers
  const handleDateSelect = (dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  }) => {
    // Convert Date objects to ISO strings for Redux  serialization
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
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReserveClick = () => {
    if (!authUser) {
      setShowSignInModal(true);
    } else {
      setShowBookingWizard(true);
    }
  };

  const handleAuthSuccess = (authenticatedUser: any) => {
    setShowSignInModal(false);
    setShowBookingWizard(true);
  };

  // Amenities mapping
  const amenityIcons: Record<string, any> = {
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
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-ocean-200 border-t-ocean-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading marina details...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (!marina) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Anchor className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Marina not found
          </h1>
          <p className="text-gray-600 mb-6">
            The marina you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate("/discover")}
            className="bg-ocean-600 hover:bg-ocean-700"
          >
            Browse Marinas
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to extract amenity names
  const getAmenityList = (): string[] => {
    if (!marina.amenities || !Array.isArray(marina.amenities)) return [];

    return marina.amenities.map((amenity: any) => {
      if (typeof amenity === "string") return amenity;
      if (typeof amenity === "object" && amenity.name) return amenity.name;
      return String(amenity);
    });
  };

  const amenityList = getAmenityList();

  const selectedSlipDetails = selectedSlip
    ? availableSlips.find((slip) => slip.id === selectedSlip)
    : null;
  const totalCost =
    selectedSlipDetails && bookingDuration
      ? selectedSlipDetails.pricePerDay * bookingDuration
      : 0;
  const serviceFee = totalCost * 0.1; // 10% service fee
  const finalTotal = totalCost + serviceFee;

  return (
    <div className="min-h-screen bg-white">
      <MetaHelmet
        title={`${marina.name} - ${marina.city}, ${marina.state || marina.country}`}
        description={
          marina.description ||
          `Book a slip at ${marina.name} in ${marina.city}, ${marina.state || marina.country}. ${marina.total_slips} slips available starting at $${marina.price_per_day}/night. Real-time availability and instant booking.`
        }
        keywords={`${marina.name}, ${marina.city} marina, ${marina.country} marina, boat slip ${marina.city}, yacht berth ${marina.city}, marina booking ${marina.city}, dock rental ${marina.city}`}
        image={
          marina.images && marina.images.length > 0
            ? typeof marina.images[0] === "string"
              ? marina.images[0]
              : marina.images[0].url
            : undefined
        }
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
      />
      {/* Floating Back Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed top-6 left-6 z-50"
      >
        <Button
          onClick={() => navigate(-1)}
          className="bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white border border-gray-200/50 shadow-lg rounded-full h-12 w-12 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-4 gap-3 h-[450px] sm:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
            <div
              className="col-span-4 sm:col-span-2 bg-cover bg-center cursor-pointer relative group transition-all duration-500 hover:scale-[1.02]"
              style={{ backgroundImage: `url(${marinaImages[0]})` }}
              onClick={() => setShowImageGallery(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">
                    View Gallery
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:grid grid-rows-2 gap-3">
              {marinaImages.slice(1, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="bg-cover bg-center cursor-pointer relative group transition-all duration-500 hover:scale-[1.05] rounded-lg overflow-hidden"
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => {
                    setCurrentImageIndex(idx + 1);
                    setShowImageGallery(true);
                  }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                </div>
              ))}
            </div>

            <div className="hidden sm:grid grid-rows-2 gap-3">
              {marinaImages.slice(3, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="bg-cover bg-center cursor-pointer relative group transition-all duration-500 hover:scale-[1.05] rounded-lg overflow-hidden"
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => {
                    setCurrentImageIndex(idx + 3);
                    setShowImageGallery(true);
                  }}
                >
                  {idx === 1 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center group-hover:bg-black/60 transition-all duration-500">
                      <div className="text-white text-center transform group-hover:scale-110 transition-transform duration-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-base font-semibold">
                          +{marinaImages.length - 5} photos
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-0">
            {/* Header Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-wrap gap-3">
                  {marina.is_featured && (
                    <Badge className="bg-gradient-to-r from-ocean-500 to-ocean-700 text-white px-4 py-1.5 text-xs font-semibold shadow-md">
                      <Award className="h-3.5 w-3.5 mr-1.5" />
                      Featured
                    </Badge>
                  )}
                  {marina.avg_rating && (
                    <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1.5" />
                      <span className="text-sm font-bold text-gray-900">
                        {Number(marina.avg_rating).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1.5">
                        ({marina.review_count})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center text-gray-700 hover:bg-gray-100 rounded-full h-11 w-11 p-0 transition-all duration-200 hover:scale-110"
                  >
                    <Share className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center rounded-full h-11 w-11 p-0 transition-all duration-200 hover:scale-110 ${
                      isLiked
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-200 ${isLiked ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
                {marina.name}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-gray-600">
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MapPin className="h-5 w-5 mr-2 text-ocean-600" />
                  <span className="font-medium">
                    {marina.city}, {marina.state || marina.country}
                  </span>
                </div>
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Anchor className="h-5 w-5 mr-2 text-ocean-600" />
                  <span className="font-medium">
                    {marina.total_slips} slips
                  </span>
                </div>
                <div className="flex items-center bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 rounded-lg">
                  <Navigation className="h-5 w-5 mr-2 text-emerald-600" />
                  <span>{marina.available_slips} available</span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-8 pb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this marina
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {marina.description}
              </p>
            </motion.div>

            <div className="border-t border-gray-100 my-6" />

            {/* What this place offers */}
            {amenityList.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="py-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {amenityList
                    .slice(0, 12)
                    .map((amenity: string, index: number) => {
                      const IconComponent = amenityIcons[amenity] || Check;
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ocean-50 flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-ocean-600" />
                          </div>
                          <span className="text-gray-800 font-medium text-sm">
                            {amenity}
                          </span>
                        </div>
                      );
                    })}
                </div>
                {amenityList.length > 12 && (
                  <Button
                    variant="outline"
                    className="mt-6 border-gray-300 hover:border-ocean-500 hover:text-ocean-600"
                  >
                    Show all {amenityList.length} amenities
                  </Button>
                )}
              </motion.div>
            )}

            <div className="border-t border-gray-100 my-6" />

            {/* Where you'll be */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="py-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Where you'll be
              </h2>

              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg mb-4">
                <p className="text-gray-900 font-semibold text-base">
                  {marina.address}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {marina.city}, {marina.state} {marina.postal_code}
                </p>
              </div>

              {marina.latitude && marina.longitude ? (
                <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(marina.longitude) - 0.01},${Number(marina.latitude) - 0.01},${Number(marina.longitude) + 0.01},${Number(marina.latitude) + 0.01}&layer=mapnik&marker=${marina.latitude},${marina.longitude}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="Marina Location"
                  />
                </div>
              ) : (
                <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Location map unavailable</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-6"
            >
              {/* Pricing Card */}
              <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="p-6">
                    <BookingCalendar
                      marinaId={marina.id}
                      availability={availability}
                      selectedDateRange={selectedDateRange}
                      selectedSlip={selectedSlipDetails}
                      pricePerDay={marina.price_per_day}
                      onDateSelect={handleDateSelect}
                      onSlipSelect={handleSlipSelect}
                    />

                    {/* Booking Summary */}
                    {totalCost > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="space-y-4">
                          <div className="flex justify-between text-gray-700">
                            <span>
                              ${selectedSlipDetails?.pricePerDay} ×{" "}
                              {bookingDuration} nights
                            </span>
                            <span>${totalCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Service fee</span>
                            <span>${serviceFee.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        <Button
                          size="lg"
                          className="w-full mt-6 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                          disabled={
                            !selectedDateRange.checkIn ||
                            !selectedDateRange.checkOut ||
                            !selectedSlip ||
                            isCheckingAuth
                          }
                          onClick={handleReserveClick}
                        >
                          {isCheckingAuth ? "Loading..." : "Reserve"}
                        </Button>

                        <p className="text-sm text-gray-500 text-center mt-3">
                          You won't be charged yet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-2 border-gray-100 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-5 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center mr-3">
                      <Phone className="h-5 w-5 text-ocean-600" />
                    </div>
                    Contact host
                  </h3>
                  <div className="space-y-4">
                    {marina.contact?.phone && (
                      <div className="flex items-center p-3 rounded-lg hover:bg-white transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-ocean-100 transition-colors">
                          <Phone className="h-4 w-4 text-gray-500 group-hover:text-ocean-600 transition-colors" />
                        </div>
                        <a
                          href={`tel:${marina.contact.phone}`}
                          className="text-ocean-600 hover:text-ocean-700 font-semibold flex-1"
                        >
                          {marina.contact.phone}
                        </a>
                      </div>
                    )}
                    {marina.contact?.email && (
                      <div className="flex items-center p-3 rounded-lg hover:bg-white transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-ocean-100 transition-colors">
                          <Mail className="h-4 w-4 text-gray-500 group-hover:text-ocean-600 transition-colors" />
                        </div>
                        <a
                          href={`mailto:${marina.contact.email}`}
                          className="text-ocean-600 hover:text-ocean-700 font-semibold flex-1 truncate"
                        >
                          {marina.contact.email}
                        </a>
                      </div>
                    )}
                    {marina.contact?.website && (
                      <div className="flex items-center p-3 rounded-lg hover:bg-white transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-ocean-100 transition-colors">
                          <Globe2 className="h-4 w-4 text-gray-500 group-hover:text-ocean-600 transition-colors" />
                        </div>
                        <a
                          href={marina.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ocean-600 hover:text-ocean-700 font-semibold flex-1 truncate"
                        >
                          Visit website
                        </a>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-5 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                    <Mail className="h-4 w-4 mr-2" />
                    Message host
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 text-white bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold">
                  {currentImageIndex + 1} / {marinaImages.length}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-300">{marina.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageGallery(false)}
                className="text-white hover:bg-white/20 h-12 w-12 p-0 rounded-full transition-all duration-300 hover:rotate-90"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Image Container with Side Navigation */}
            <div className="flex-1 flex items-center justify-center px-20 relative">
              {/* Left Arrow */}
              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev > 0 ? prev - 1 : marinaImages.length - 1,
                  )
                }
                className="absolute left-4 text-white hover:bg-white/20 rounded-full h-14 w-14 p-0 backdrop-blur-sm bg-black/30 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              {/* Image */}
              <motion.div
                key={currentImageIndex}
                initial={{ scale: 0.95, opacity: 0, x: 100 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.95, opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-full max-h-full"
              >
                <img
                  src={marinaImages[currentImageIndex]}
                  alt={`${marina.name} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              </motion.div>

              {/* Right Arrow */}
              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentImageIndex(
                    (prev) => (prev + 1) % marinaImages.length,
                  )
                }
                className="absolute right-4 text-white hover:bg-white/20 rounded-full h-14 w-14 p-0 backdrop-blur-sm bg-black/30 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-center items-center space-x-3 overflow-x-auto pb-2">
                  {marinaImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 transition-all duration-300 ${
                        index === currentImageIndex
                          ? "ring-4 ring-white shadow-2xl scale-110"
                          : "opacity-50 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Booking Wizard */}
      {selectedSlip && (
        <BookingWizard
          isOpen={showBookingWizard}
          onClose={() => {
            setShowBookingWizard(false);
            setTimeout(() => {
              dispatch(setSelectedSlip(null));
            }, 300); // Wait for modal exit animation
          }}
          marina={marina}
          slip={availableSlips.find((s) => s.id === selectedSlip)}
          dateRange={selectedDateRange}
          totalCost={
            selectedDateRange.checkIn && selectedDateRange.checkOut
              ? bookingDuration *
                (availableSlips.find((s) => s.id === selectedSlip)
                  ?.pricePerDay || 0)
              : 0
          }
          serviceFee={
            selectedDateRange.checkIn && selectedDateRange.checkOut
              ? bookingDuration *
                (availableSlips.find((s) => s.id === selectedSlip)
                  ?.pricePerDay || 0) *
                0.15
              : 0
          }
          user={authUser}
        />
      )}
    </div>
  );
};

export default MarinaDetail;
