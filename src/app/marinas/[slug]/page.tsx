"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  const slug = params.slug as string;

  const [marina, setMarina] = useState<MarinaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    fetchMarinaDetails();
  }, [slug]);

  const fetchMarinaDetails = async () => {
    try {
      const response = await fetch(`/api/marinas/${slug}`);
      const data = await response.json();

      if (data.success) {
        setMarina(data.data);
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

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    router.push(`/booking/${slug}?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚓</div>
          <p className="text-gray-600">Loading marina details...</p>
        </div>
      </div>
    );
  }

  if (!marina) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏴</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Marina not found
          </h2>
          <Link href="/marinas" className="text-ocean-600 hover:text-ocean-700">
            ← Back to search
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
            className="text-ocean-600 hover:text-ocean-700 font-medium"
          >
            ← Back to search
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
                    ⭐ Featured
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{marina.rating.average}</span>
                  <span>({marina.rating.count} reviews)</span>
                </span>
                <span>
                  📍 {marina.location.city}, {marina.location.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
            <div className="col-span-4 md:col-span-2 md:row-span-2 h-96 md:h-full">
              <img
                src={marina.images[selectedImage]?.url || marina.images[0]?.url}
                alt={marina.name}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
              />
            </div>
            {marina.images.slice(1, 5).map((image, index) => (
              <div
                key={image.id}
                className="h-48 cursor-pointer"
                onClick={() => setSelectedImage(index + 1)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover hover:opacity-90 transition"
                />
              </div>
            ))}
          </div>
        </div>

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
                    <span className="text-2xl">{amenity.icon}</span>
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
                  <div className="text-2xl font-bold text-gray-900">
                    🚢 {marina.capacity.totalSlips}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">
                    Available Slips
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ✓ {marina.capacity.availableSlips}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">
                    Max Boat Length
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    📏 {marina.capacity.maxBoatLength}m
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm mb-1">Max Draft</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ⚓ {marina.capacity.maxBoatDraft}m
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
                <p className="text-gray-700">📍 {marina.location.address}</p>
                <p className="text-gray-700">
                  {marina.location.city}, {marina.location.state}{" "}
                  {marina.location.postalCode}
                </p>
                <p className="text-gray-700">{marina.location.country}</p>
              </div>
              {/* Map placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>Map view</p>
                  <p className="text-sm">
                    {marina.location.coordinates.latitude.toFixed(4)},{" "}
                    {marina.location.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reviews ({marina.rating.count})
              </h2>

              {marina.reviews.length === 0 ? (
                <p className="text-gray-600">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
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
                            <span className="text-yellow-500">
                              {"⭐".repeat(review.rating)}
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
              )}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Marina
              </h2>
              <div className="space-y-3">
                {marina.contact.name && (
                  <p className="text-gray-700">👤 {marina.contact.name}</p>
                )}
                {marina.contact.email && (
                  <p className="text-gray-700">✉️ {marina.contact.email}</p>
                )}
                {marina.contact.phone && (
                  <p className="text-gray-700">📞 {marina.contact.phone}</p>
                )}
                {marina.contact.website && (
                  <a
                    href={marina.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ocean-600 hover:text-ocean-700"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-ocean-600 mb-1">
                  ${marina.pricePerDay}
                </div>
                <div className="text-gray-600">per day</div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  />
                </div>
              </div>

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

              {/* Coupons */}
              {marina.coupons.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-semibold text-green-800 mb-2">
                    🎉 Available Discounts
                  </div>
                  {marina.coupons.map((coupon, index) => (
                    <div key={index} className="text-sm text-green-700">
                      <span className="font-mono bg-green-100 px-2 py-1 rounded">
                        {coupon.code}
                      </span>{" "}
                      - {coupon.description}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleBooking}
                className="w-full bg-ocean-600 hover:bg-ocean-700 text-white font-semibold py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Reserve Now
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
