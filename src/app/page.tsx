"use client";

import MetaHelmet from "@/components/MetaHelmet";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
  FaGlobe,
  FaBolt,
  FaShieldAlt,
  FaAnchor,
  FaApple,
  FaGooglePlay,
  FaStar,
} from "react-icons/fa";
import { MdDirectionsBoat } from "react-icons/md";

export default function HomePage() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchData.location) params.append("location", searchData.location);
    if (searchData.checkIn) params.append("checkIn", searchData.checkIn);
    if (searchData.checkOut) params.append("checkOut", searchData.checkOut);

    router.push(`/marinas?${params.toString()}`);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <MetaHelmet
        title="DockNow - Find and Book Marina Slips Instantly"
        description="Discover and reserve premium marina slips across Mexico. Real-time availability, instant booking, and transparent pricing. Your perfect dock awaits at DockNow."
        ogUrl="https://docknow.app"
        canonical="https://docknow.app"
      />
      <div className="min-h-screen bg-white">
        {/* Glassmorphic Header */}
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background Video (Desktop) / Image (Mobile) with Overlay */}
          <div className="absolute inset-0">
            {/* Video for Desktop */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="hidden md:block absolute inset-0 w-full h-full object-cover"
            >
              <source
                src="https://disruptinglabs.com/data/assets/videos/13836837_960_540_30fps.mp4"
                type="video/mp4"
              />
            </video>

            {/* Image for Mobile */}
            <div
              className="md:hidden absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070')",
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-800/85 to-ocean-800/90" />

            {/* Subtle Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full py-32">
            {/* Main Heading with Glass Effect */}
            <div className="mb-8 space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight drop-shadow-2xl">
                Find Your Perfect
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-ocean-500 bg-clip-text text-transparent mt-2">
                  Marina Slip
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Discover and book marina slips & private docks worldwide with
                instant confirmation
              </p>
            </div>

            {/* Search Form with Enhanced Glass Effect */}
            <form onSubmit={handleSearch} className="max-w-5xl mx-auto mb-12">
              <div className="relative group">
                {/* Glass Container with Subtle Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-[2rem] blur-sm opacity-60"></div>
                <div className="relative backdrop-blur-xl bg-white/80 rounded-[2rem] shadow-2xl p-5 md:p-6 border border-white/60">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-3">
                    {/* Location */}
                    <div className="flex-1">
                      <label className="flex items-center text-xs font-semibold text-navy-900 mb-1.5 ml-1">
                        <FaMapMarkerAlt className="mr-1.5 text-cyan-600 text-sm" />
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="City, state, or marina name..."
                        value={searchData.location}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border-0 bg-white/90 focus:ring-2 focus:ring-cyan-500 text-gray-900 placeholder-gray-500 transition-all shadow-sm hover:shadow-md font-medium text-sm backdrop-blur-sm"
                      />
                    </div>

                    {/* Check-in Date */}
                    <div className="flex-1">
                      <label className="flex items-center text-xs font-semibold text-navy-900 mb-1.5 ml-1">
                        <FaCalendarAlt className="mr-1.5 text-cyan-600 text-sm" />
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={searchData.checkIn}
                        min={today}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            checkIn: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border-0 bg-white/90 focus:ring-2 focus:ring-cyan-500 text-gray-900 transition-all shadow-sm hover:shadow-md font-medium text-sm backdrop-blur-sm"
                      />
                    </div>

                    {/* Check-out Date */}
                    <div className="flex-1">
                      <label className="flex items-center text-xs font-semibold text-navy-900 mb-1.5 ml-1">
                        <FaCalendarAlt className="mr-1.5 text-cyan-600 text-sm" />
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={searchData.checkOut}
                        min={searchData.checkIn || today}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            checkOut: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border-0 bg-white/90 focus:ring-2 focus:ring-cyan-500 text-gray-900 transition-all shadow-sm hover:shadow-md font-medium text-sm backdrop-blur-sm"
                      />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="relative w-full md:w-auto text-white font-bold py-3 px-8 md:px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center overflow-hidden group hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-600"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <FaSearch className="text-lg relative z-10 md:mr-0" />
                        <span className="ml-2 md:hidden relative z-10">
                          Search
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/marinas"
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-[length:200%_100%] animate-gradient"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
                <MdDirectionsBoat className="mr-2 text-2xl relative z-10" />
                <span className="relative z-10">Explore All Marinas</span>
              </Link>
            </div>

            {/* Trust Indicators with Glass Cards */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center shadow-xl hover:bg-white/15 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  500+
                </div>
                <div className="text-sm text-gray-200 font-medium">
                  Marinas Worldwide
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center shadow-xl hover:bg-white/15 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  10K+
                </div>
                <div className="text-sm text-gray-200 font-medium">
                  Happy Boaters
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center shadow-xl hover:bg-white/15 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center">
                  4.9{" "}
                  <FaStar className="text-yellow-400 ml-2 text-2xl drop-shadow-lg" />
                </div>
                <div className="text-sm text-gray-200 font-medium">
                  Average Rating
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center shadow-xl hover:bg-white/15 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-200 font-medium">
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
                Why Choose DockNow?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The most trusted platform for finding and booking marina slips
                worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-2xl"></div>
                  <FaGlobe className="text-3xl text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-navy-900">
                  Global Network
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Access thousands of marinas and private docks across the globe
                  with real-time availability and instant booking.
                </p>
              </div>

              <div className="group backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="relative bg-gradient-to-br from-yellow-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-2xl"></div>
                  <FaBolt className="text-3xl text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-navy-900">
                  Instant Booking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Book your slip in seconds with instant confirmation through
                  our web or mobile app. No waiting, no hassle.
                </p>
              </div>

              <div className="group backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-2xl"></div>
                  <FaShieldAlt className="text-3xl text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-navy-900">
                  Secure Payments
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Safe and secure transactions powered by Stripe with full
                  payment protection and instant receipts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-gradient-to-br from-navy-900 via-navy-800 to-ocean-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1569163139394-de4798aa62b0?q=80&w=2070')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-10 text-gray-200">
              Download our mobile app and book your next marina slip in seconds
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="group relative inline-flex items-center justify-center backdrop-blur-xl bg-white/90 border border-white/30 text-navy-900 font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                <FaApple className="text-2xl mr-3 relative z-10" />
                <div className="text-left relative z-10">
                  <div className="text-xs text-gray-600">Download on the</div>
                  <div className="text-lg font-bold">App Store</div>
                </div>
              </button>
              <button className="group relative inline-flex items-center justify-center backdrop-blur-xl bg-white/90 border border-white/30 text-navy-900 font-bold py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                <FaGooglePlay className="text-2xl mr-3 relative z-10" />
                <div className="text-left relative z-10">
                  <div className="text-xs text-gray-600">Get it on</div>
                  <div className="text-lg font-bold">Google Play</div>
                </div>
              </button>
            </div>

            <div className="text-gray-300 text-sm">
              Join over 10,000 boaters who trust DockNow for their marina
              reservations
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
