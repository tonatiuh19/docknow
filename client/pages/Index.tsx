import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";

const Index = () => {
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

  const destinations = [
    {
      name: "Monaco",
      image:
        "https://images.pexels.com/photos/25237448/pexels-photo-25237448.jpeg",
      rating: 4.9,
      spots: "12 Available",
    },
    {
      name: "Ibiza",
      image:
        "https://images.pexels.com/photos/15181123/pexels-photo-15181123.jpeg",
      rating: 4.8,
      spots: "8 Available",
    },
    {
      name: "Mykonos",
      image:
        "https://images.pexels.com/photos/15181124/pexels-photo-15181124.jpeg",
      rating: 4.7,
      spots: "5 Available",
    },
    {
      name: "Miami",
      image:
        "https://images.pexels.com/photos/15181125/pexels-photo-15181125.jpeg",
      rating: 4.9,
      spots: "15 Available",
    },
  ];

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
                    <div className="space-y-4">
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
                              defaultValue="Bahamas"
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
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-navy-400">
                            Boat Size
                          </label>
                          <Input
                            placeholder="Select size"
                            className="border-none bg-navy-50/50 focus-visible:ring-ocean-500 h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-ocean hover:shadow-glow text-white h-14 text-lg font-bold border-none rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        asChild
                      >
                        <Link to="/discover">
                          <Search className="w-5 h-5 mr-2" />
                          Explore Now
                        </Link>
                      </Button>
                    </div>
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

            {/* Right Side - Interactive Element */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-4 ring-1 ring-white/20 shadow-2xl overflow-hidden group">
                <div className="bg-navy-950 rounded-[2rem] h-[600px] flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="relative text-center p-8">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-24 h-24 bg-gradient-ocean rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow rotate-12"
                    >
                      <MapPin className="w-12 h-12 text-white" />
                    </motion.div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-center justify-center gap-3 text-sm text-ocean-200 mb-3">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                        Live Map View
                      </div>
                      <p className="font-bold text-2xl text-white mb-2">
                        Coming Very Soon
                      </p>
                      <p className="text-ocean-100/60 text-sm max-w-[200px]">
                        Track your vessel and explore ports in real-time.
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
            {destinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative h-[400px] rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-navy-200/50">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-1">
                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                      {dest.rating}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {dest.name}
                    </h3>
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-navy-500 font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {dest.spots}
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
                For Marina Managers
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Complete CRM for{" "}
                <span className="text-ocean-400">Modern Marinas.</span>
              </h2>
              <p className="text-xl text-navy-300 leading-relaxed">
                Empower your staff and delight your guests with our all-in-one
                management suite. From real-time occupancy tracking to automated
                billing and guest communication.
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

              <Button className="h-14 px-10 rounded-xl bg-ocean-500 hover:bg-ocean-600 text-white border-none text-lg font-bold transition-all shadow-xl shadow-ocean-500/20">
                Request a Demo
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
