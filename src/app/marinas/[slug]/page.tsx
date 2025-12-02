"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMapPin,
  FiStar,
  FiAnchor,
  FiMaximize2,
  FiMail,
  FiPhone,
  FiGlobe,
  FiUser,
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { useStore } from "@/store/store";
import LoadingSpinner from "@/components/LoadingSpinner";
import ImageCarousel from "@/components/marina/ImageCarousel";
import DateAvailabilityCalendar from "@/components/marina/DateAvailabilityCalendar";
import AmenityIcon from "@/components/marina/AmenityIcon";
import AuthModal from "@/components/AuthModal";
import dynamic from "next/dynamic";

// Dynamically import MarinaMap to avoid SSR issues with Leaflet
const MarinaMap = dynamic(() => import("@/components/MarinaMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
      <LoadingSpinner size="sm" message="Loading map..." />
    </div>
  ),
});

interface MarinaDetails {
  id: number;
  slug: string;
  name: string;
  description: string;
  pricePerDay: number;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
  capacity: {
    totalSlips: number;
    availableSlips: number;
    maxBoatLength: number;
    maxBoatDraft: number;
  };
  businessType: {
    name: string;
    description: string;
  };
  isFeatured: boolean;
  rating: {
    average: string;
    count: number;
  };
  images: Array<{
    id: number;
    url: string;
    title: string;
    isPrimary: boolean;
  }>;
  amenities: Array<{
    id: number;
    name: string;
    icon: string;
    category: string;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      name: string;
      avatar: string;
    };
  }>;
  availability: {
    blockedDates: Array<{ date: string; reason: string }>;
    bookedDates: Array<{ checkIn: string; checkOut: string }>;
  };
  coupons: Array<{
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    minDays: number;
  }>;
}

export default function MarinaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const marinaAvailability = useStore((state) => state.marinaAvailability);
  const marinaAvailabilityLoading = useStore(
    (state) => state.marinaAvailabilityLoading
  );
  const fetchMarinaAvailability = useStore(
    (state) => state.fetchMarinaAvailability
  );
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);

  const [marina, setMarina] = useState<MarinaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchMarinaDetails();
  }, [slug]);

  const fetchMarinaDetails = async () => {
    try {
      const response = await fetch(`/api/marinas/${slug}`);
      const data = await response.json();

      if (data.success) {
        setMarina(data.data);
        // Fetch availability data using the marina ID
        if (data.data?.id) {
          fetchMarinaAvailability(data.data.id);
        }
      }
    } catch (error) {
      console.error("Error fetching marina details:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!marina || !checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    return days * marina.pricePerDay;
  };

  const handleDateSelect = (newCheckIn: string, newCheckOut: string | null) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Redirect to checkout page with boat selection
    router.push(
      `/checkout?marinaSlug=${slug}&checkIn=${checkIn}&checkOut=${checkOut}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" message="Loading marina details..." />
      </div>
    );
  }

  if (!marina) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAnchor className="w-24 h-24 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Marina not found
          </h2>
          <Link
            href="/marinas"
            className="text-ocean-600 hover:text-ocean-700 inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const totalDays =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const subtotal = calculateTotalPrice();
  const serviceFee = subtotal * 0.1; // 10% service fee
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/marinas"
            className="text-ocean-600 hover:text-ocean-700 font-medium inline-flex items-center gap-2 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {marina.name}
                {marina.isFeatured && (
                  <span className="ml-3 inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    <FiStar className="inline w-4 h-4 mr-1" />
                    Featured
                  </span>
                )}
                {marina.reviews.length === 0 && (
                  <span className="ml-3 inline-block bg-ocean-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    New
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{marina.rating.average}</span>
                  <span>({marina.rating.count} reviews)</span>
                </span>
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  {marina.location.city}, {marina.location.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Carousel */}
        <ImageCarousel images={marina.images} marinaName={marina.name} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this marina
              </h2>
              <div className="mb-4">
                <span className="inline-block bg-ocean-100 text-ocean-800 px-3 py-1 rounded-full text-sm font-medium">
                  {marina.businessType.name}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {marina.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {marina.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2">
                    <div className="text-ocean-600">
                      <AmenityIcon
                        iconName={amenity.icon}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity & Specifications */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Marina Specifications
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-600 text-sm mb-1">Total Slips</div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiAnchor className="w-6 h-6 text-ocean-600" />
                    {marina.capacity.totalSlips}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">
                    Available Slips
                  </div>
                  <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    <FiAnchor className="w-6 h-6" />
                    {marina.capacity.availableSlips}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">
                    Max Boat Length
                  </div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiMaximize2 className="w-6 h-6 text-ocean-600" />
                    {marina.capacity.maxBoatLength}m
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Max Draft</div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiAnchor className="w-6 h-6 text-ocean-600" />
                    {marina.capacity.maxBoatDraft}m
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Location
              </h2>
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-ocean-600" />
                  {marina.location.address}
                </p>
                <p className="text-gray-700">
                  {marina.location.city}, {marina.location.state}{" "}
                  {marina.location.postalCode}
                </p>
                <p className="text-gray-700">{marina.location.country}</p>
              </div>
              {/* Interactive Map */}
              <div
                className="rounded-lg overflow-hidden h-80"
                id="marina-detail-map"
              >
                <MarinaMap
                  marinas={[
                    {
                      id: marina.id,
                      name: marina.name,
                      slug: marina.slug,
                      description: marina.description,
                      location: `${marina.location.city}, ${marina.location.state}`,
                      coordinates: {
                        lat: marina.location.coordinates.latitude,
                        lng: marina.location.coordinates.longitude,
                      },
                      contact_email: marina.contact.email,
                      contact_phone: marina.contact.phone,
                      image_url:
                        marina.images.find((img) => img.isPrimary)?.url ||
                        marina.images[0]?.url,
                      price_per_day: marina.pricePerDay,
                      is_active: true,
                      is_featured: marina.isFeatured,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                  ]}
                  height="320px"
                  selectedMarinaId={marina.id}
                />
              </div>
            </div>

            {/* Reviews */}
            {marina.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Reviews ({marina.rating.count})
                </h2>

                <div className="space-y-4">
                  {marina.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center text-ocean-700 font-bold">
                          {review.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {review.user.name}
                            </span>
                            <span className="flex items-center gap-0.5 text-yellow-500">
                              {Array.from({ length: review.rating }).map(
                                (_, i) => (
                                  <FiStar
                                    key={i}
                                    className="w-4 h-4 fill-yellow-500"
                                  />
                                )
                              )}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-1">{review.comment}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24 space-y-6">
              <div>
                <div className="text-3xl font-bold text-ocean-600 mb-1 flex items-center gap-2">
                  <FiDollarSign className="w-8 h-8" />
                  {marina.pricePerDay}
                </div>
                <div className="text-gray-600">per day</div>
              </div>

              {/* Date Availability Calendar */}
              {marinaAvailabilityLoading === "loading" ? (
                <div className="py-8">
                  <LoadingSpinner size="sm" message="Loading availability..." />
                </div>
              ) : (
                <DateAvailabilityCalendar
                  bookedDates={marinaAvailability?.bookedDates || []}
                  blockedDates={marinaAvailability?.blockedDates || []}
                  availableSlips={marinaAvailability?.availableSlips || []}
                  selectedCheckIn={checkIn}
                  selectedCheckOut={checkOut}
                  onDateSelect={handleDateSelect}
                  minDate={today}
                  totalSlips={marina?.capacity?.totalSlips}
                />
              )}

              {/* Price Breakdown */}
              {checkIn && checkOut && totalDays > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>
                      ${marina.pricePerDay} × {totalDays} days
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service fee (10%)</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!checkIn || !checkOut}
                className="w-full bg-ocean-600 hover:bg-ocean-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FiCalendar className="w-5 h-5" />
                Reserve Now
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
