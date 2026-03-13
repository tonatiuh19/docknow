import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MarinaMap from "@/components/MarinaMap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMarinas,
  fetchPopularDestinations,
} from "@/store/slices/discoverySlice";
import { selectDiscoveryViewData } from "@/store/selectors/discoverySelectors";
import {
  MapPin,
  Shield,
  Globe,
  Search,
  ArrowRight,
  Calendar,
  CheckCircle,
  Smartphone,
  LayoutDashboard,
  BarChart3,
  Users2,
  Settings,
  Star,
  Zap,
  Heart,
  SmartphoneIcon,
  Apple,
  PlayCircle,
  Navigation,
  LocateFixed,
  X,
  Lock,
  Anchor,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { marinas, loading: marinasLoading } = useAppSelector(
    selectDiscoveryViewData,
  );
  const popularDestinations = useAppSelector(
    (state) => state.discovery.popularDestinations,
  );
  const popularDestinationsLoading = useAppSelector(
    (state) => state.discovery.loading.popularDestinations,
  );

  // Location state
  type LocationStatus = "idle" | "requesting" | "granted" | "denied";
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationDismissed, setLocationDismissed] = useState(false);

  // Search form state
  const [searchLocation, setSearchLocation] = useState("Bahamas");

  // Fetch featured marinas for the map
  useEffect(() => {
    dispatch(fetchMarinas({ limit: 10, featured: true }));
    dispatch(fetchPopularDestinations(8));
  }, [dispatch]);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 8000 },
    );
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const DESTINATION_FALLBACK =
    "https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?auto=compress&cs=tinysrgb&w=800";

  return (
    <Layout>
      <MetaHelmet
        title="DockNow - Find & Book Marina Slips Instantly"
        description="Discover and book marina slips worldwide with DockNow. Real-time availability, instant booking, and secure payments for boat owners and marina operators."
        keywords="marina booking, boat slip rental, yacht berth, marina reservation, dock rental, boat parking, marine slip, harbor booking, boat dock, marina management"
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[100svh] flex flex-col">
        {/* Background Video — poster is the fallback */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/Sb8LzJvA.jpeg"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source
            src="https://garbrix.com/navios/assets/videos/dock_now.mp4"
            type="video/mp4"
          />
        </video>

        {/* Layered cinematic overlays */}
        {/* Base dark fill — keeps the whole frame moody */}
        <div className="absolute inset-0 bg-navy-950/55" />
        {/* Left-heavy directional shadow — pushes text forward */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/30" />
        {/* Top + bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-navy-950/55" />
        {/* Edge vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(2,6,23,0.65) 100%)",
          }}
        />

        {/* Ambient glow accent behind left content */}
        <div className="absolute top-1/2 left-0 w-[700px] h-[700px] -translate-y-1/2 -translate-x-1/3 bg-ocean-500/12 rounded-full blur-[140px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
            <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-12 xl:gap-20 items-center">
              {/* ── Left Content ── */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10"
              >
                {/* Badge pill */}
                <motion.div variants={itemVariants}>
                  <div className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-md border border-white/15 rounded-full px-5 py-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)] animate-pulse" />
                    <span className="text-sm font-medium text-white/80 tracking-wide">
                      Real-time slip availability — now live
                    </span>
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h1
                    className="font-black tracking-tighter leading-[0.92]"
                    style={{ fontSize: "clamp(3rem,7.5vw,5.5rem)" }}
                  >
                    <span className="block text-white">The World's</span>
                    <motion.span
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="block bg-gradient-to-r from-ocean-300 via-white to-ocean-200 bg-[length:220%_auto] bg-clip-text text-transparent"
                    >
                      Marina Network
                    </motion.span>
                    <span className="block text-white/70">
                      — All in One Place.
                    </span>
                  </h1>
                  <p className="text-lg text-white/50 max-w-md leading-relaxed pt-2">
                    Discover, compare, and instantly book marina slips across
                    the globe. Built for every captain.
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => navigate("/discover")}
                    className="inline-flex items-center gap-3 bg-gradient-ocean text-white font-bold text-lg rounded-2xl px-10 py-5 shadow-[0_20px_48px_rgba(3,105,161,0.45)] hover:opacity-90 hover:shadow-[0_24px_56px_rgba(3,105,161,0.55)] active:scale-95 transition-all duration-200"
                  >
                    <Search className="w-5 h-5" />
                    Explore Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* Trust row */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap items-center gap-7 text-sm"
                >
                  {(
                    [
                      { icon: CheckCircle, label: "Instant confirmation" },
                      { icon: Shield, label: "Secure checkout" },
                      { icon: Globe, label: "Worldwide coverage" },
                    ] as const
                  ).map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-white/45"
                    >
                      <Icon className="w-4 h-4 text-ocean-400/70" />
                      <span>{label}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* ── Right Side – Dark-glass map card ── */}
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.35,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="relative hidden lg:block"
              >
                {/* Glow ring behind card */}
                <div className="absolute -inset-6 bg-ocean-500/8 rounded-[3rem] blur-3xl pointer-events-none" />

                <div className="relative rounded-[1.75rem] overflow-hidden ring-1 ring-white/12 shadow-[0_40px_80px_rgba(0,0,0,0.65)] bg-navy-950/70 backdrop-blur-sm">
                  {/* macOS-style window chrome */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-navy-950/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.9)]" />
                        <span className="text-xs font-semibold text-white/60 tracking-wide">
                          Live Marina Network
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/discover"
                      className="flex items-center gap-1 text-xs font-bold text-ocean-300/80 hover:text-ocean-200 transition-colors"
                    >
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Location prompt strip */}
                  <AnimatePresence>
                    {locationStatus === "idle" && !locationDismissed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 bg-ocean-500/10 border-b border-ocean-500/15 px-5 py-2.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-ocean-400 shrink-0" />
                        <p className="text-xs text-ocean-200/70 flex-1">
                          Show marinas near you?
                        </p>
                        <button
                          onClick={handleRequestLocation}
                          className="text-xs font-bold text-ocean-300 hover:text-white transition-colors shrink-0"
                        >
                          Use location
                        </button>
                        <button
                          onClick={() => setLocationDismissed(true)}
                          className="text-white/25 hover:text-white/60 transition-colors ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                    {locationStatus === "requesting" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 bg-ocean-500/10 border-b border-ocean-500/15 px-5 py-2.5"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <LocateFixed className="w-3.5 h-3.5 text-ocean-400" />
                        </motion.div>
                        <p className="text-xs text-ocean-200/70">
                          Detecting location…
                        </p>
                      </motion.div>
                    )}
                    {locationStatus === "granted" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 bg-green-500/10 border-b border-green-500/15 px-5 py-2.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <p className="text-xs text-green-300/70">
                          Showing marinas near your location
                        </p>
                      </motion.div>
                    )}
                    {locationStatus === "denied" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 bg-red-500/10 border-b border-red-500/15 px-5 py-2.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <p className="text-xs text-red-300/70">
                          Showing global marinas
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Map area */}
                  <div className="h-[460px] relative">
                    {marinasLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-900/60">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-10 h-10 border-2 border-white/10 border-t-ocean-400 rounded-full"
                        />
                      </div>
                    ) : marinas.length > 0 ? (
                      <MarinaMap
                        marinas={marinas}
                        userLocation={userLocation}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-900/60">
                        <p className="text-white/30 text-sm">
                          No marinas found
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer bar */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-navy-950/50">
                    <span className="text-xs text-white/35">
                      <span className="text-ocean-300 font-semibold">
                        {marinas.length}
                      </span>{" "}
                      marinas active worldwide
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      <span className="text-[11px] text-white/30">
                        Real-time data
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-6"
          >
            <div className="text-left">
              <h2 className="text-4xl font-bold text-navy-900 mb-4">
                Popular Destinations
              </h2>
              <p className="text-xl text-navy-500 max-w-2xl">
                Explore the most sought-after marinas and coastal gems chosen by
                our community.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-navy-200 hover:bg-navy-50 text-navy-900 h-12 px-8 flex items-center gap-2"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {popularDestinationsLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="group">
                    <div className="relative h-[280px] sm:h-[400px] rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-navy-200/50 bg-navy-100 animate-pulse" />
                    <div className="px-2 space-y-2">
                      <div className="h-4 w-28 bg-navy-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))
              : popularDestinations.slice(0, 4).map((dest, index) => (
                  <motion.div
                    key={`${dest.city}-${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/discover?searchTerm=${encodeURIComponent(dest.city)}`,
                      )
                    }
                  >
                    <div className="relative h-[280px] sm:h-[400px] rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-navy-200/50">
                      <img
                        src={dest.image_url ?? DESTINATION_FALLBACK}
                        alt={dest.city}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            DESTINATION_FALLBACK)
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        {dest.avg_rating !== null && (
                          <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-1">
                            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                            {dest.avg_rating.toFixed(1)}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-white">
                          {dest.city}
                        </h3>
                        {dest.state && (
                          <p className="text-white/60 text-sm">{dest.state}</p>
                        )}
                      </div>
                    </div>
                    <div className="px-2">
                      <div className="text-navy-500 font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {dest.marina_count}{" "}
                        {dest.marina_count === 1 ? "Marina" : "Marinas"}{" "}
                        Available
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 sm:py-32 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
              Why Choose Dock Now?
            </h2>
            <p className="text-xl text-navy-500 max-w-2xl mx-auto">
              We provide the most comprehensive tools for boaters worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: MapPin,
                title: "Interactive Map",
                description:
                  "Explore ports worldwide with our high-fidelity map. Filter by amenities and size.",
                color: "from-ocean-400 to-ocean-600",
              },
              {
                icon: Calendar,
                title: "Easy Booking",
                description:
                  "One-click reservations with instant confirmation and secure escrow payments.",
                color: "from-ocean-600 to-navy-700",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description:
                  "From the Mediterranean to the Caribbean, we have you covered globally.",
                color: "from-navy-600 to-navy-800",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white shadow-xl shadow-navy-200/50 hover:shadow-2xl hover:shadow-ocean-500/20 transition-all duration-300"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:rotate-6`}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-navy-900">
                  {feature.title}
                </h3>
                <p className="text-navy-500 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 sm:py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-ocean rounded-[3rem] p-12 aspect-square flex items-center justify-center relative overflow-hidden shadow-2xl">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute inset-0 bg-[url('https://images.pexels.com/photos/11216260/pexels-photo-11216260.jpeg')] bg-cover bg-center opacity-30"
                />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl max-w-[320px]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                      <img
                        src="https://garbrix.com/navios/assets/images/logo.png"
                        alt="Dock Now Logo"
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold">Dock Now App</p>
                      <p className="text-white/60 text-xs">
                        Ready for adventure
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-white/10 rounded-xl flex items-center px-4 gap-3 border border-white/5"
                      >
                        <div className="w-6 h-6 rounded-full bg-ocean-400/20" />
                        <div className="h-2 w-24 bg-white/20 rounded-full" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 flex justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-[2rem] shadow-2xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-navy-900">100k+</p>
                    <p className="text-xs text-navy-400">Downloads</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-50 rounded-full text-ocean-700 font-bold text-sm mb-4">
                <Smartphone className="w-4 h-4" />
                Mobile First Experience
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight">
                Docking at your{" "}
                <span className="bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent">
                  fingertips.
                </span>
              </h2>
              <p className="text-xl text-navy-500 leading-relaxed">
                Take the power of Dock Now anywhere you sail. Our mobile app for
                iOS and Android gives you real-time notifications, offline maps,
                and one-tap booking.
              </p>

              <div className="grid md:grid-cols-2 gap-8 py-4">
                {[
                  {
                    title: "Real-time Alerts",
                    desc: "Get notified when spots open up.",
                  },
                  {
                    title: "Offline Maps",
                    desc: "Navigate even without connection.",
                  },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-ocean-600" />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">{f.title}</p>
                      <p className="text-navy-400 text-sm">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button className="h-16 px-8 rounded-2xl bg-navy-950 hover:bg-black text-white border-none flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-xl">
                  <Apple className="w-7 h-7" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-navy-400">
                      Download on the
                    </p>
                    <p className="text-lg font-bold">App Store</p>
                  </div>
                </Button>
                <Button className="h-16 px-8 rounded-2xl bg-navy-950 hover:bg-black text-white border-none flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-xl">
                  <PlayCircle className="w-7 h-7" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-navy-400">
                      Get it on
                    </p>
                    <p className="text-lg font-bold">Google Play</p>
                  </div>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marina CRM Section */}
      <section className="py-16 sm:py-32 bg-navy-950 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-ocean-500/10 rounded-full blur-[100px]"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-ocean-400 font-bold text-sm mb-4 border border-white/10">
                <LayoutDashboard className="w-4 h-4" />
                For Marinas &amp; Private Ports
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                The All-in-One Platform for{" "}
                <span className="text-ocean-400">
                  Modern Marinas &amp; Private Ports.
                </span>
              </h2>
              <p className="text-xl text-navy-300 leading-relaxed">
                Whether you run a full-service marina or a private port, DockNow
                gives you the tools to manage occupancy, automate billing, and
                delight every guest — all from one powerful dashboard.
              </p>

              <div className="space-y-4 py-6">
                {[
                  {
                    icon: BarChart3,
                    title: "Real-time Analytics",
                    desc: "Track revenue and occupancy trends at a glance.",
                  },
                  {
                    icon: Users2,
                    title: "Guest Profiles",
                    desc: "Deliver personalized service with detailed boat & owner profiles.",
                  },
                  {
                    icon: Settings,
                    title: "Automated Billing",
                    desc: "Eliminate manual paperwork with integrated payment systems.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-ocean-500/30 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-ocean-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white mb-1">
                        {item.title}
                      </p>
                      <p className="text-navy-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                className="h-14 px-10 rounded-xl bg-ocean-500 hover:bg-ocean-600 text-white border-none text-lg font-bold transition-all shadow-xl shadow-ocean-500/20 flex items-center gap-2"
                asChild
              >
                <Link to="/become-a-member">
                  <Lock className="w-5 h-5" />
                  Become a Member
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-[2.5rem] bg-navy-900 p-4 border border-white/10 shadow-[0_0_50px_rgba(2,132,199,0.2)] overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/6253568/pexels-photo-6253568.jpeg"
                  alt="CRM Dashboard Mockup"
                  className="rounded-[2rem] w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-navy-950 via-transparent to-ocean-500/20" />

                {/* Dashboard UI Overlay Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-12 left-12 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl max-w-[200px]"
                >
                  <p className="text-xs font-bold text-ocean-400 uppercase tracking-widest mb-4">
                    Occupancy
                  </p>
                  <div className="h-24 w-full flex items-end gap-2">
                    {[40, 70, 50, 90, 60].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-ocean-500/40 rounded-t-lg"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-2xl font-black text-white">84%</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute bottom-12 right-12 p-6 rounded-2xl bg-navy-950/90 border border-white/10 shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="text-white font-bold">New Booking</p>
                      <p className="text-xs text-navy-400">Marina del Sol</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-ocean" />
        <motion.div
          animate={{ x: [-100, 100], y: [-50, 50] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Set Sail?
            </h2>
            <p className="text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-medium">
              Join 10,000+ captains who book their docking with confidence.
            </p>

            <Button
              size="lg"
              className="bg-white text-ocean-600 hover:bg-navy-50 shadow-2xl px-12 py-8 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
              asChild
            >
              <Link to="/discover">
                Get Started Now
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
