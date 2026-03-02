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
  Calendar,
  Shield,
  Globe,
  Search,
  ArrowRight,
  Clock,
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

  const [useVideoBackground, setUseVideoBackground] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Location state
  type LocationStatus = "idle" | "requesting" | "granted" | "denied";
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationDismissed, setLocationDismissed] = useState(false);

  // Search form state
  const [searchLocation, setSearchLocation] = useState("Bahamas");
  const [checkInDate, setCheckInDate] = useState("");
  const [boatSize, setBoatSize] = useState("");

  useEffect(() => {
    // Fallback to image if video doesn't load within 3 seconds
    const timeout = setTimeout(() => {
      if (!videoLoaded) {
        setUseVideoBackground(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [videoLoaded]);

  // Fetch featured marinas for the map
  useEffect(() => {
    dispatch(fetchMarinas({ limit: 10, featured: true }));
    dispatch(fetchPopularDestinations(8));
  }, [dispatch]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchLocation) params.append("searchTerm", searchLocation);
    if (checkInDate) params.append("checkIn", checkInDate);
    if (boatSize) params.append("minBoatLength", boatSize);

    navigate(`/discover?${params.toString()}`);
  };

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
      <section className="relative overflow-hidden bg-gradient-hero pt-32 pb-16 lg:pt-48 lg:pb-32">
        {/* Video/Image Background */}
        {useVideoBackground ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setUseVideoBackground(false)}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source
              src="https://garbrix.com/navios/assets/videos/dock_now.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?auto=compress&cs=tinysrgb&w=1920')",
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-ocean-900/80 to-navy-950/90" />

        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-ocean-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                  <span className="text-white">Find & Reserve</span>
                  <br />
                  <motion.span
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="bg-gradient-to-r from-ocean-400 via-white to-ocean-200 bg-[length:200%_auto] bg-clip-text text-transparent"
                  >
                    Boat Docking
                  </motion.span>
                  <br />
                  <span className="text-white">Worldwide</span>
                </h1>

                <p className="text-xl text-ocean-100 mt-8 max-w-lg leading-relaxed">
                  Discover ports, explore premium facilities, and book your
                  perfect docking space with our intuitive global platform.
                </p>
              </motion.div>

              {/* Search Interface */}
              <motion.div variants={itemVariants}>
                <Card className="p-2 shadow-2xl border-none bg-white/10 backdrop-blur-xl ring-1 ring-white/20">
                  <div className="bg-white rounded-2xl p-6 shadow-inner">
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-navy-400">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-500 w-4 h-4" />
                            <Input
                              placeholder="Search ports..."
                              className="pl-10 border-none bg-navy-50/50 focus-visible:ring-ocean-500 h-12 rounded-xl"
                              value={searchLocation}
                              onChange={(e) =>
                                setSearchLocation(e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-navy-400">
                            Check-in
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-500 w-4 h-4" />
                            <Input
                              placeholder="Select date"
                              className="pl-10 border-none bg-navy-50/50 focus-visible:ring-ocean-500 h-12 rounded-xl"
                              type="date"
                              value={checkInDate}
                              onChange={(e) => setCheckInDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-navy-400">
                            Boat Size (ft)
                          </label>
                          <Input
                            placeholder="e.g., 30"
                            className="border-none bg-navy-50/50 focus-visible:ring-ocean-500 h-12 rounded-xl"
                            type="number"
                            min="0"
                            value={boatSize}
                            onChange={(e) => setBoatSize(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-ocean hover:shadow-glow text-white h-14 text-lg font-bold border-none rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Explore Now
                      </Button>
                    </form>
                  </div>
                </Card>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-8 text-sm text-ocean-100/80"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Instant booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-400" />
                  </div>
                  <span>24/7 support</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Live Marina Map */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-4 ring-1 ring-white/20 shadow-2xl overflow-hidden">
                <div className="bg-white rounded-[2rem] h-[600px] flex flex-col relative overflow-hidden">
                  {/* Map Header */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white via-white to-transparent p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                          <span className="text-sm font-bold text-navy-600">
                            Live Map
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-navy-900">
                          Featured Marinas
                        </h3>
                      </div>
                      <Link
                        to="/discover"
                        className="px-4 py-2 bg-gradient-ocean text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                      >
                        View All
                      </Link>
                    </div>

                    {/* Location prompt */}
                    <AnimatePresence>
                      {locationStatus === "idle" && !locationDismissed && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mt-3 flex items-center gap-2 bg-ocean-50 border border-ocean-200 rounded-xl px-3 py-2"
                        >
                          <Navigation className="w-4 h-4 text-ocean-600 shrink-0" />
                          <p className="text-xs text-ocean-700 font-medium flex-1">
                            Show marinas near you?
                          </p>
                          <button
                            onClick={handleRequestLocation}
                            className="text-xs font-bold text-white bg-ocean-500 hover:bg-ocean-600 px-3 py-1 rounded-lg transition-colors shrink-0"
                          >
                            Use my location
                          </button>
                          <button
                            onClick={() => setLocationDismissed(true)}
                            className="text-navy-400 hover:text-navy-600 transition-colors"
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
                          className="mt-3 flex items-center gap-2 bg-ocean-50 border border-ocean-200 rounded-xl px-3 py-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <LocateFixed className="w-4 h-4 text-ocean-600" />
                          </motion.div>
                          <p className="text-xs text-ocean-700 font-medium">
                            Detecting your location…
                          </p>
                        </motion.div>
                      )}
                      {locationStatus === "granted" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <p className="text-xs text-green-700 font-medium">
                            Showing marinas near your location
                          </p>
                        </motion.div>
                      )}
                      {locationStatus === "denied" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                        >
                          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-xs text-red-600 font-medium">
                            Location access denied — showing global marinas
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interactive Map */}
                  <div className="flex-1 relative">
                    {marinasLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-50">
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-12 h-12 border-4 border-ocean-200 border-t-ocean-600 rounded-full mx-auto mb-4"
                          />
                          <p className="text-navy-600 font-medium">
                            Loading marinas...
                          </p>
                        </div>
                      </div>
                    ) : marinas.length > 0 ? (
                      <MarinaMap
                        marinas={marinas}
                        userLocation={userLocation}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-50">
                        <div className="text-center p-8">
                          <MapPin className="w-16 h-16 text-navy-300 mx-auto mb-4" />
                          <p className="text-navy-600 font-medium">
                            No marinas found
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Map Footer Info */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white via-white to-transparent p-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-navy-100 shadow-lg">
                      <p className="text-sm text-navy-600 text-center">
                        <span className="font-bold text-ocean-600">
                          {marinas.length}
                        </span>{" "}
                        marinas ready to welcome you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
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

          <div className="grid md:grid-cols-4 gap-8">
            {popularDestinationsLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="group">
                    <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-navy-200/50 bg-navy-100 animate-pulse" />
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
                    <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-navy-200/50">
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
      <section className="py-32 bg-navy-50">
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
                color: "from-purple-400 to-purple-600",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description:
                  "From the Mediterranean to the Caribbean, we have you covered globally.",
                color: "from-orange-400 to-orange-600",
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
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
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
      <section className="py-32 bg-navy-950 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-ocean-500/10 rounded-full blur-[100px]"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
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
      <section className="py-32 relative overflow-hidden">
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
