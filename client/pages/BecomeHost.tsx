import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  nextStep,
  prevStep,
  updateFormData,
  toggleAmenity,
  submitMarinaRegistration,
  resetOnboarding,
  goToStep,
} from "@/store/slices/hostOnboardingSlice";
import { MarinaRegistrationRequest } from "@shared/api";
import {
  Anchor,
  MapPin,
  Building2,
  Waves,
  Zap,
  Droplets,
  Wifi,
  Fuel,
  ShowerHead,
  Shield,
  UtensilsCrossed,
  WashingMachine,
  ParkingCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Ruler,
  LocateFixed,
  Star,
  Sailboat,
  Ship,
  Lock,
  ArrowRight,
  Check,
  Building,
  Warehouse,
  ImageIcon,
  Upload,
  X,
  Layers,
  Loader2,
  Eye,
  FileCheck,
  AlertCircle,
  Sun,
  Droplet,
  Hexagon,
  Mountain,
  Flower2,
  CircleDot,
  Leaf,
  Shuffle,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  {
    id: 1,
    label: "Full Service Marina",
    description: "Wet slips, fuel dock, full facilities and amenities",
    icon: Anchor,
    gradient: "from-ocean-500 to-ocean-700",
  },
  {
    id: 2,
    label: "Dry Storage Marina",
    description: "Secure land-based boat storage with launch services",
    icon: Warehouse,
    gradient: "from-purple-500 to-purple-700",
  },
  {
    id: 3,
    label: "Private Port",
    description: "Exclusive private docking facility or berths",
    icon: Lock,
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    id: 4,
    label: "Yacht Club",
    description: "Members-only club with premium marina facilities",
    icon: Star,
    gradient: "from-amber-500 to-amber-700",
  },
  {
    id: 5,
    label: "Harbor",
    description:
      "Protected harbor with moorings and anchorages — coves are sub-locations within or near the harbor",
    icon: Sailboat,
    gradient: "from-teal-500 to-cyan-700",
  },
];

const AMENITIES = [
  { id: 1, label: "Electricity", icon: Zap },
  { id: 2, label: "Water", icon: Droplets },
  { id: 3, label: "WiFi", icon: Wifi },
  { id: 4, label: "Fuel", icon: Fuel },
  { id: 5, label: "Restrooms", icon: Building },
  { id: 6, label: "Showers", icon: ShowerHead },
  { id: 7, label: "Security", icon: Shield },
  { id: 8, label: "Restaurant", icon: UtensilsCrossed },
  { id: 9, label: "Laundry", icon: WashingMachine },
  { id: 10, label: "Parking", icon: ParkingCircle },
];

const UPLOAD_BASE_URL = "https://disruptinglabs.com";
const UPLOAD_API = `${UPLOAD_BASE_URL}/data/api/uploadImages.php`;

const SEABED_TYPES = [
  {
    id: 1,
    label: "Sand",
    icon: Sun,
    iconColor: "text-amber-400",
    holding: "good",
    holdingColor: "text-green-400",
  },
  {
    id: 2,
    label: "Mud",
    icon: Droplet,
    iconColor: "text-brown-400",
    holding: "excellent",
    holdingColor: "text-emerald-400",
  },
  {
    id: 3,
    label: "Clay",
    icon: Hexagon,
    iconColor: "text-orange-400",
    holding: "excellent",
    holdingColor: "text-emerald-400",
  },
  {
    id: 4,
    label: "Rock",
    icon: Mountain,
    iconColor: "text-slate-400",
    holding: "poor",
    holdingColor: "text-red-400",
  },
  {
    id: 5,
    label: "Coral",
    icon: Flower2,
    iconColor: "text-pink-400",
    holding: "poor",
    holdingColor: "text-red-400",
  },
  {
    id: 6,
    label: "Gravel",
    icon: CircleDot,
    iconColor: "text-stone-400",
    holding: "moderate",
    holdingColor: "text-yellow-400",
  },
  {
    id: 7,
    label: "Weed",
    icon: Leaf,
    iconColor: "text-green-400",
    holding: "poor",
    holdingColor: "text-red-400",
  },
  {
    id: 8,
    label: "Mixed",
    icon: Shuffle,
    iconColor: "text-purple-400",
    holding: "moderate",
    holdingColor: "text-yellow-400",
  },
];

const FEATURES = [
  { key: "has_fuel_dock", label: "Fuel Dock" },
  { key: "has_pump_out", label: "Pump-Out Station" },
  { key: "has_haul_out", label: "Haul-Out Service" },
  { key: "has_boat_ramp", label: "Boat Ramp" },
  { key: "has_dry_storage", label: "Dry Storage" },
  { key: "has_live_aboard", label: "Live-Aboard Allowed" },
  { key: "accepts_transients", label: "Accepts Transients" },
  { key: "accepts_megayachts", label: "Accepts Megayachts" },
] as const;

const STEPS = [
  { number: 1, title: "Venue Type" },
  { number: 2, title: "Basic Info" },
  { number: 3, title: "Location" },
  { number: 4, title: "Seabed" },
  { number: 5, title: "Facilities" },
  { number: 6, title: "Amenities" },
  { number: 7, title: "Gallery" },
  { number: 8, title: "Contact" },
  { number: 9, title: "Your Account" },
  { number: 10, title: "Review" },
];

// ─── Test data (localhost only) ──────────────────────────────────────────────

const IS_LOCALHOST =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const TEST_DATA = {
  business_type_id: 1,
  name: "Sunset Harbour Marina",
  description:
    "A premier full-service marina nestled in a sheltered bay, offering 120 wet slips, a fuel dock, and world-class amenities. We welcome boats from 20ft to 150ft and provide 24/7 security for your peace of mind.",
  price_per_day: "85",
  address: "1234 Marina Boulevard",
  city: "Miami",
  state: "Florida",
  country: "United States",
  postal_code: "33101",
  latitude: "25.774200",
  longitude: "-80.190300",
  seabed_type_id: 1,
  seabed_depth_meters: "12.5",
  seabed_description: "Sandy bottom with excellent visibility",
  seabed_notes: "Good anchor holding, easy retrieval",
  total_slips: "120",
  max_boat_length_meters: "46",
  max_boat_draft_meters: "3.5",
  has_fuel_dock: true,
  has_pump_out: true,
  has_haul_out: false,
  has_boat_ramp: true,
  has_dry_storage: false,
  has_live_aboard: true,
  accepts_transients: true,
  accepts_megayachts: true,
  contact_name: "Carlos Navarro",
  contact_email: "dock@sunsetharbour.com",
  contact_phone: "+1 305 555 0198",
  website_url: "https://sunsetharbour.com",
  host_name: "Felix Gomez",
  host_email: "tonatiuh.gom@gmail.com",
  host_phone: "+1 305 555 0100",
  company_name: "Sunset Harbour LLC",
  amenity_ids: [1, 2, 3, 4, 5, 6, 7, 10],
};

// ─── Yup schemas per step ─────────────────────────────────────────────────────

const step2Schema = Yup.object({
  name: Yup.string()
    .min(3, "At least 3 characters")
    .required("Name is required"),
  description: Yup.string()
    .min(20, "Please describe your venue (min 20 characters)")
    .required("Description is required"),
  price_per_day: Yup.number()
    .typeError("Enter a valid number")
    .positive("Must be positive")
    .required("Price per day is required"),
});

const step3Schema = Yup.object({
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  latitude: Yup.number()
    .typeError("Enter valid latitude")
    .min(-90)
    .max(90)
    .required("Latitude is required"),
  longitude: Yup.number()
    .typeError("Enter valid longitude")
    .min(-180)
    .max(180)
    .required("Longitude is required"),
});

const step5Schema = Yup.object({
  total_slips: Yup.number()
    .typeError("Enter a valid number")
    .integer("Must be whole number")
    .min(1)
    .required("Total slips required"),
});

const step8Schema = Yup.object({
  contact_name: Yup.string().required("Contact name is required"),
  contact_email: Yup.string()
    .email("Invalid email")
    .required("Contact email is required"),
});

const step9Schema = Yup.object({
  host_name: Yup.string().required("Your name is required"),
  host_email: Yup.string()
    .email("Invalid email")
    .required("Your email is required"),
});

// ─── Wizard step animations ───────────────────────────────────────────────────

// Tracks pending File objects by their blob URL — avoids storing non-serializable
// data in Redux. Files are uploaded on final submit, not on selection.
const pendingFileMap = new Map<string, File>();

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

const BecomeHost = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentStep, formData, submitting, submitted, error } =
    useAppSelector((state) => state.hostOnboarding);
  const [uploading, setUploading] = useState(false);
  const directionRef = useRef(1);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    directionRef.current = currentStep > prevStepRef.current ? 1 : -1;
    prevStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: "instant" });
  }, [submitted]);

  // Location auto-detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      dispatch(
        updateFormData({
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }),
      );
    });
  };

  const goNext = () => {
    dispatch(nextStep());
  };

  const goBack = () => {
    dispatch(prevStep());
  };

  const handleSubmit = async () => {
    setUploading(true);
    const fd = formData;

    // ── Upload any pending local files before submitting ──────────────────────
    let finalCoverUrl = fd.cover_image_url;
    let finalGalleryUrls = [...(fd.gallery_image_urls ?? [])];

    const hasPendingCover =
      fd.cover_image_url && pendingFileMap.has(fd.cover_image_url);
    const pendingGalleryIndexes = finalGalleryUrls
      .map((url, i) => (pendingFileMap.has(url) ? i : -1))
      .filter((i) => i !== -1);

    if (hasPendingCover || pendingGalleryIndexes.length > 0) {
      const tempId = fd.temp_upload_id || `marina-temp-${Date.now()}`;
      dispatch(updateFormData({ temp_upload_id: tempId }));

      const form = new FormData();
      form.append("main_folder", "docknow");
      form.append("id", tempId);

      if (hasPendingCover) {
        form.append("main_image", pendingFileMap.get(fd.cover_image_url!)!);
      }
      pendingGalleryIndexes.forEach((i) => {
        form.append("images[]", pendingFileMap.get(finalGalleryUrls[i])!);
      });

      try {
        const res = await axios.post(UPLOAD_API, form);
        if (hasPendingCover && res.data?.main_image?.path) {
          finalCoverUrl = UPLOAD_BASE_URL + res.data.main_image.path;
        }
        if (
          pendingGalleryIndexes.length > 0 &&
          res.data?.extra_images?.length
        ) {
          pendingGalleryIndexes.forEach((idx, j) => {
            if (res.data.extra_images[j]?.path) {
              finalGalleryUrls[idx] =
                UPLOAD_BASE_URL + res.data.extra_images[j].path;
            }
          });
        }
        // Revoke all blob URLs and clear the map
        pendingFileMap.forEach((_, url) => URL.revokeObjectURL(url));
        pendingFileMap.clear();
      } catch {
        // Upload failed — still proceed with blob URLs as fallback;
        // the API will just store nulls for image fields
      }
    }

    setUploading(false);
    const payload: MarinaRegistrationRequest = {
      host_name: fd.host_name,
      host_email: fd.host_email,
      host_phone: fd.host_phone || undefined,
      company_name: fd.company_name || undefined,
      business_type_id: fd.business_type_id,
      name: fd.name,
      description: fd.description,
      price_per_day: parseFloat(fd.price_per_day),
      address: fd.address,
      city: fd.city,
      state: fd.state || undefined,
      country: fd.country,
      postal_code: fd.postal_code || undefined,
      latitude: parseFloat(fd.latitude),
      longitude: parseFloat(fd.longitude),
      seabed_type_id: fd.seabed_type_id || undefined,
      seabed_depth_meters: fd.seabed_depth_meters
        ? parseFloat(fd.seabed_depth_meters)
        : undefined,
      seabed_description: fd.seabed_description || undefined,
      seabed_notes: fd.seabed_notes || undefined,
      cover_image_url: finalCoverUrl || undefined,
      gallery_image_urls:
        finalGalleryUrls.length > 0 ? finalGalleryUrls : undefined,
      temp_upload_id: fd.temp_upload_id || undefined,
      contact_name: fd.contact_name,
      contact_email: fd.contact_email,
      contact_phone: fd.contact_phone || undefined,
      website_url: fd.website_url || undefined,
      total_slips: parseInt(fd.total_slips) || 0,
      max_boat_length_meters: fd.max_boat_length_meters
        ? parseFloat(fd.max_boat_length_meters)
        : undefined,
      max_boat_draft_meters: fd.max_boat_draft_meters
        ? parseFloat(fd.max_boat_draft_meters)
        : undefined,
      has_fuel_dock: fd.has_fuel_dock,
      has_pump_out: fd.has_pump_out,
      has_haul_out: fd.has_haul_out,
      has_boat_ramp: fd.has_boat_ramp,
      has_dry_storage: fd.has_dry_storage,
      has_live_aboard: fd.has_live_aboard,
      accepts_transients: fd.accepts_transients,
      accepts_megayachts: fd.accepts_megayachts,
      amenity_ids: fd.amenity_ids,
    };
    dispatch(submitMarinaRegistration(payload));
  };

  const progressPercent = Math.round(
    ((currentStep - 1) / (STEPS.length - 1)) * 100,
  );

  const handleFillTestData = () => {
    const { amenity_ids, ...rest } = TEST_DATA;
    dispatch(updateFormData(rest));
    // Reset amenities then add test ones
    dispatch(updateFormData({ amenity_ids: [] }));
    amenity_ids.forEach((id) => dispatch(toggleAmenity(id)));
    dispatch(goToStep(1));
  };

  if (submitted) {
    return (
      <Layout>
        <MetaHelmet
          title="Welcome to DockNow - Application Received"
          description="Your marina or private port application has been received."
          url={typeof window !== "undefined" ? window.location.href : ""}
        />
        <section className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-ocean-950 flex items-center justify-center px-4 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl w-full text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-28 h-28 mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 animate-pulse opacity-30 blur-xl" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-[0_0_60px_rgba(14,165,233,0.5)]">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Application Received!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-navy-300 mb-4 leading-relaxed"
            >
              Welcome to DockNow! Your marina / private port has been submitted
              for review.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-navy-400 mb-10 leading-relaxed"
            >
              Our team will review your listing within{" "}
              <span className="text-ocean-400 font-semibold">
                1–2 business days
              </span>
              . You'll receive a welcome email with next steps and your host
              credentials.
            </motion.p>

            {/* Info cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 mb-10"
            >
              {[
                {
                  icon: Mail,
                  label: "Check your inbox",
                  sub: "Welcome email on its way",
                },
                {
                  icon: Shield,
                  label: "Under review",
                  sub: "1–2 business days",
                },
                {
                  icon: CheckCircle2,
                  label: "Go live!",
                  sub: "Start accepting bookings",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                >
                  <div className="w-10 h-10 bg-ocean-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-ocean-400" />
                  </div>
                  <p className="text-white text-sm font-semibold">
                    {item.label}
                  </p>
                  <p className="text-navy-400 text-xs mt-1">{item.sub}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => {
                  dispatch(resetOnboarding());
                  navigate("/");
                }}
                className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-8 py-3 rounded-xl font-bold text-base border-none shadow-xl shadow-ocean-500/20 flex items-center gap-2"
              >
                Back to Home <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-bold text-primary"
              >
                <Link to="/discover">Explore Marinas</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <MetaHelmet
        title="Become a Member - List Your Marina or Private Port | DockNow"
        description="Join DockNow as a marina or private port host. List your facility and start accepting bookings from boaters worldwide."
        url={typeof window !== "undefined" ? window.location.href : ""}
      />

      {/* Hero banner */}
      <section className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-ocean-950 pt-24 pb-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-ocean-500/5 rounded-full blur-[80px] pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-500/10 border border-ocean-500/20 rounded-full text-ocean-400 font-semibold text-sm mb-6">
              <Anchor className="w-4 h-4" />
              Marina & Private Port Membership
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              List Your{" "}
              <span className="bg-gradient-to-r from-ocean-400 to-ocean-200 bg-clip-text text-transparent">
                Venue
              </span>{" "}
              on DockNow
            </h1>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto">
              Join our global network of marinas and private ports. Reach
              thousands of boaters and manage bookings effortlessly.
            </p>

            {IS_LOCALHOST && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-5"
              >
                <button
                  type="button"
                  onClick={handleFillTestData}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 text-amber-400 hover:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Fill Test Data
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Step progress */}
          <div className="mb-10">
            {/* Bar */}
            <div className="relative h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-ocean-500 to-ocean-300 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Step pills */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {STEPS.map((step) => {
                const done = currentStep > step.number;
                const active = currentStep === step.number;
                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-center gap-1.5 min-w-[52px]"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        done
                          ? "bg-ocean-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                          : active
                            ? "bg-ocean-500/20 border-2 border-ocean-500 text-ocean-400"
                            : "bg-white/5 border border-white/20 text-navy-400"
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : step.number}
                    </div>
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "text-ocean-400"
                          : done
                            ? "text-ocean-500"
                            : "text-navy-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <AnimatePresence custom={directionRef.current} mode="wait">
              <motion.div
                key={currentStep}
                custom={directionRef.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-8 md:p-12"
              >
                {currentStep === 1 && (
                  <Step1VenueType
                    value={formData.business_type_id}
                    onChange={(id) =>
                      dispatch(updateFormData({ business_type_id: id }))
                    }
                    onNext={goNext}
                  />
                )}
                {currentStep === 2 && (
                  <Step2BasicInfo
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Location
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onDetectLocation={handleDetectLocation}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Seabed
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 5 && (
                  <Step5Facilities
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 6 && (
                  <Step6Amenities
                    selectedIds={formData.amenity_ids}
                    onToggle={(id) => dispatch(toggleAmenity(id))}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 7 && (
                  <Step7Gallery
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 8 && (
                  <Step8Contact
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onNext={goNext}
                    onBack={goBack}
                  />
                )}
                {currentStep === 9 && (
                  <Step9HostAccount
                    data={formData}
                    onChange={(vals) => dispatch(updateFormData(vals))}
                    onBack={goBack}
                    onNext={goNext}
                  />
                )}
                {currentStep === 10 && (
                  <Step10Review
                    data={formData}
                    onBack={goBack}
                    onSubmit={handleSubmit}
                    submitting={uploading || submitting}
                    error={error}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Layout>
  );
};

// ─── Step components ──────────────────────────────────────────────────────────

function StepHeader({
  title,
  subtitle,
  icon: Icon,
  optional = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  optional?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-ocean-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-ocean-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        {optional && (
          <span className="text-xs font-semibold text-navy-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            optional
          </span>
        )}
      </div>
      <p className="text-navy-300 ml-13">{subtitle}</p>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  onSubmit,
  nextLabel = "Continue",
  nextDisabled = false,
  submitting = false,
  hideBack = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  submitting?: boolean;
  hideBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
      {!hideBack && onBack ? (
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="text-navy-300 hover:text-white hover:bg-white/10 rounded-xl px-6 py-3 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      ) : (
        <span />
      )}

      {onNext && (
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-8 py-3 rounded-xl font-bold border-none shadow-lg shadow-ocean-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={submitting || nextDisabled}
          className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white px-8 py-3 rounded-xl font-bold border-none shadow-lg shadow-ocean-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Submitting…
            </>
          ) : (
            <>
              Submit Application <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Step 1 - Venue Type
function Step1VenueType({
  value,
  onChange,
  onNext,
}: {
  value: number;
  onChange: (id: number) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeader
        icon={Ship}
        title="What kind of venue are you listing?"
        subtitle="Select the type that best describes your facility."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {BUSINESS_TYPES.map((bt) => {
          const Icon = bt.icon;
          const selected = value === bt.id;
          return (
            <motion.button
              key={bt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(bt.id)}
              className={`relative p-6 rounded-2xl border text-left transition-all duration-200 group ${
                selected
                  ? "border-ocean-500 bg-ocean-500/10 shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-ocean-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bt.gradient} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{bt.label}</h3>
              <p className="text-navy-400 text-sm">{bt.description}</p>
            </motion.button>
          );
        })}
      </div>

      <NavButtons onNext={onNext} nextLabel="Continue" hideBack />
    </div>
  );
}

// Step 2 - Basic Info
function Step2BasicInfo({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (v: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const formik = useFormik({
    initialValues: {
      name: data.name,
      description: data.description,
      price_per_day: data.price_per_day,
    },
    validationSchema: step2Schema,
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
    enableReinitialize: false,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <StepHeader
        icon={Building2}
        title="Tell us about your venue"
        subtitle="Give boaters a clear picture of what you offer."
      />

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-navy-200 mb-2">
            Venue Name <span className="text-red-400">*</span>
          </label>
          <Input
            name="name"
            placeholder="e.g. Sunset Bay Marina"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-400 text-xs mt-1">
              {String(formik.errors.name)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy-200 mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <Textarea
            name="description"
            placeholder="Describe your venue — facilities, atmosphere, what makes it special…"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={5}
            className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 rounded-xl focus-visible:ring-ocean-500 resize-none"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-400 text-xs mt-1">
              {String(formik.errors.description)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy-200 mb-2">
            Base Price per Day (USD) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
            <Input
              name="price_per_day"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 150"
              value={formik.values.price_per_day}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
          </div>
          {formik.touched.price_per_day && formik.errors.price_per_day && (
            <p className="text-red-400 text-xs mt-1">
              {String(formik.errors.price_per_day)}
            </p>
          )}
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() => formik.handleSubmit()}
        nextLabel="Continue"
      />
    </form>
  );
}

// Step 3 - Location
function Step3Location({
  data,
  onChange,
  onDetectLocation,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (v: any) => void;
  onDetectLocation: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const formik = useFormik({
    initialValues: {
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postal_code,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    validationSchema: step3Schema,
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <StepHeader
        icon={MapPin}
        title="Where is your venue located?"
        subtitle="Accurate location helps boaters find and navigate to you."
      />

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-navy-200 mb-2">
            Street Address <span className="text-red-400">*</span>
          </label>
          <Input
            name="address"
            placeholder="123 Marina Drive"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
          />
          {formik.touched.address && formik.errors.address && (
            <p className="text-red-400 text-xs mt-1">
              {String(formik.errors.address)}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <Input
              name="city"
              placeholder="Miami"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
            {formik.touched.city && formik.errors.city && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.city)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              State / Province
            </label>
            <Input
              name="state"
              placeholder="Florida"
              value={formik.values.state}
              onChange={formik.handleChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Country <span className="text-red-400">*</span>
            </label>
            <Input
              name="country"
              placeholder="United States"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
            {formik.touched.country && formik.errors.country && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.country)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Postal Code
            </label>
            <Input
              name="postal_code"
              placeholder="33139"
              value={formik.values.postal_code}
              onChange={formik.handleChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
          </div>
        </div>

        {/* Coordinates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-navy-200">
              GPS Coordinates <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                onDetectLocation();
                // Values will be updated in store; we need to update formik too
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    formik.setFieldValue(
                      "latitude",
                      String(pos.coords.latitude.toFixed(6)),
                    );
                    formik.setFieldValue(
                      "longitude",
                      String(pos.coords.longitude.toFixed(6)),
                    );
                  });
                }
              }}
              className="flex items-center gap-1.5 text-xs text-ocean-400 hover:text-ocean-300 font-semibold transition-colors"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              Use my location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                name="latitude"
                placeholder="25.761681"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
              <p className="text-navy-500 text-xs mt-1">Latitude</p>
              {formik.touched.latitude && formik.errors.latitude && (
                <p className="text-red-400 text-xs">
                  {String(formik.errors.latitude)}
                </p>
              )}
            </div>
            <div>
              <Input
                name="longitude"
                placeholder="-80.191788"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
              <p className="text-navy-500 text-xs mt-1">Longitude</p>
              {formik.touched.longitude && formik.errors.longitude && (
                <p className="text-red-400 text-xs">
                  {String(formik.errors.longitude)}
                </p>
              )}
            </div>
          </div>
          <p className="text-navy-500 text-xs mt-2">
            Find your coordinates on{" "}
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean-400 hover:underline"
            >
              Google Maps
            </a>{" "}
            by right-clicking your location.
          </p>
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() => formik.handleSubmit()}
        nextLabel="Continue"
      />
    </form>
  );
}

// Step 4 - Seabed (optional)
function Step4Seabed({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (v: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const selected = data.seabed_type_id as number;
  const hasSelection = selected > 0;

  const handleSelect = (id: number) => {
    onChange({ seabed_type_id: selected === id ? 0 : id });
  };

  return (
    <div>
      <StepHeader
        icon={Layers}
        title="Seabed Type"
        subtitle="What type of seabed does your marina sit on? Helps boaters choose the right anchor."
        optional
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {SEABED_TYPES.map((sb) => {
          const isActive = selected === sb.id;
          const SbIcon = sb.icon;
          return (
            <button
              key={sb.id}
              type="button"
              onClick={() => handleSelect(sb.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                isActive
                  ? "border-ocean-400 bg-ocean-500/20 shadow-lg shadow-ocean-900/30"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-ocean-500/30" : "bg-white/8"}`}
              >
                <SbIcon
                  className={`w-5 h-5 ${isActive ? "text-ocean-300" : sb.iconColor}`}
                />
              </div>
              <span
                className={`text-sm font-semibold ${isActive ? "text-white" : "text-navy-200"}`}
              >
                {sb.label}
              </span>
              <span className={`text-xs font-medium ${sb.holdingColor}`}>
                {sb.holding} hold
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 pb-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-200 mb-2">
                    Depth (meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 12.5"
                    value={data.seabed_depth_meters}
                    onChange={(e) =>
                      onChange({ seabed_depth_meters: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-navy-400 focus:outline-none focus:border-ocean-400 focus:ring-1 focus:ring-ocean-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-200 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fine sandy seabed with good holding"
                    value={data.seabed_description}
                    onChange={(e) =>
                      onChange({ seabed_description: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-navy-400 focus:outline-none focus:border-ocean-400 focus:ring-1 focus:ring-ocean-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-200 mb-2">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Any additional notes about the seabed conditions..."
                  value={data.seabed_notes}
                  onChange={(e) => onChange({ seabed_notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-navy-400 focus:outline-none focus:border-ocean-400 focus:ring-1 focus:ring-ocean-400 transition-colors resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

// Step 5 - Facilities
function Step5Facilities({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (v: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const formik = useFormik({
    initialValues: {
      total_slips: data.total_slips,
      max_boat_length_meters: data.max_boat_length_meters,
      max_boat_draft_meters: data.max_boat_draft_meters,
    },
    validationSchema: step5Schema,
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
  });

  const featureValues: Record<string, boolean> = {
    has_fuel_dock: data.has_fuel_dock,
    has_pump_out: data.has_pump_out,
    has_haul_out: data.has_haul_out,
    has_boat_ramp: data.has_boat_ramp,
    has_dry_storage: data.has_dry_storage,
    has_live_aboard: data.has_live_aboard,
    accepts_transients: data.accepts_transients,
    accepts_megayachts: data.accepts_megayachts,
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <StepHeader
        icon={Ruler}
        title="Facilities & Specifications"
        subtitle="Help boaters know if their vessel fits your marina."
      />

      <div className="space-y-6">
        {/* Slip counts & sizes */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Total Slips <span className="text-red-400">*</span>
            </label>
            <Input
              name="total_slips"
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={formik.values.total_slips}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
            {formik.touched.total_slips && formik.errors.total_slips && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.total_slips)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Max Boat Length (m)
            </label>
            <Input
              name="max_boat_length_meters"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 30"
              value={formik.values.max_boat_length_meters}
              onChange={formik.handleChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Max Draft (m)
            </label>
            <Input
              name="max_boat_draft_meters"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 3.5"
              value={formik.values.max_boat_draft_meters}
              onChange={formik.handleChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
            />
          </div>
        </div>

        {/* Feature toggles */}
        <div>
          <label className="block text-sm font-semibold text-navy-200 mb-3">
            Available Features
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((feat) => {
              const active = featureValues[feat.key];
              return (
                <button
                  type="button"
                  key={feat.key}
                  onClick={() => onChange({ [feat.key]: !active })}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                    active
                      ? "border-ocean-500/60 bg-ocean-500/10 text-white"
                      : "border-white/10 bg-white/5 text-navy-400 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? "border-ocean-500 bg-ocean-500"
                        : "border-white/30"
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium">{feat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() => formik.handleSubmit()}
        nextLabel="Continue"
      />
    </form>
  );
}

// Step 6 - Amenities
function Step6Amenities({
  selectedIds,
  onToggle,
  onNext,
  onBack,
}: {
  selectedIds: number[];
  onToggle: (id: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <StepHeader
        icon={Waves}
        title="What amenities do you offer?"
        subtitle="Select all that apply — the more detail, the better."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const selected = selectedIds.includes(amenity.id);
          return (
            <motion.button
              key={amenity.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggle(amenity.id)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 ${
                selected
                  ? "border-ocean-500/60 bg-ocean-500/15 shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-ocean-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  selected ? "bg-ocean-500/30" : "bg-white/10"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${selected ? "text-ocean-400" : "text-navy-400"}`}
                />
              </div>
              <span
                className={`text-xs font-semibold text-center ${selected ? "text-white" : "text-navy-300"}`}
              >
                {amenity.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-navy-500 text-xs mt-4 text-center">
        {selectedIds.length} amenit{selectedIds.length === 1 ? "y" : "ies"}{" "}
        selected
      </p>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

// Step 7 - Gallery (optional)
function Step7Gallery({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (v: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const removeCover = () => {
    if (data.cover_image_url) {
      URL.revokeObjectURL(data.cover_image_url);
      pendingFileMap.delete(data.cover_image_url);
    }
    onChange({ cover_image_url: "" });
  };

  const removeGalleryImage = (idx: number) => {
    const url = (data.gallery_image_urls ?? [])[idx];
    if (url) {
      URL.revokeObjectURL(url);
      pendingFileMap.delete(url);
    }
    const updated = [...(data.gallery_image_urls ?? [])];
    updated.splice(idx, 1);
    onChange({ gallery_image_urls: updated });
  };

  const handleCoverSelect = (file: File) => {
    // Revoke previous blob if any
    if (data.cover_image_url && pendingFileMap.has(data.cover_image_url)) {
      URL.revokeObjectURL(data.cover_image_url);
      pendingFileMap.delete(data.cover_image_url);
    }
    const blobUrl = URL.createObjectURL(file);
    pendingFileMap.set(blobUrl, file);
    if (!data.temp_upload_id) {
      onChange({
        cover_image_url: blobUrl,
        temp_upload_id: `marina-temp-${Date.now()}`,
      });
    } else {
      onChange({ cover_image_url: blobUrl });
    }
  };

  const handleGallerySelect = (files: FileList) => {
    const current: string[] = data.gallery_image_urls ?? [];
    const remaining = 10 - current.length;
    if (remaining <= 0) return;
    const newUrls: string[] = [];
    Array.from(files)
      .slice(0, remaining)
      .forEach((f) => {
        const blobUrl = URL.createObjectURL(f);
        pendingFileMap.set(blobUrl, f);
        newUrls.push(blobUrl);
      });
    onChange({ gallery_image_urls: [...current, ...newUrls] });
  };

  return (
    <div>
      <StepHeader
        icon={ImageIcon}
        title="Photo Gallery"
        subtitle="Show off your marina with high-quality photos. A cover photo and gallery boost bookings."
        optional
      />

      {/* Cover Photo */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-navy-200 mb-3 uppercase tracking-wide">
          Cover Photo
        </h3>
        {data.cover_image_url ? (
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 group">
            <img
              src={data.cover_image_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={removeCover}
                className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full h-48 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-ocean-400 hover:bg-ocean-500/5 transition-all">
            <Upload className="w-8 h-8 text-navy-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-navy-200">
                Select cover photo
              </p>
              <p className="text-xs text-navy-400 mt-1">
                JPG, PNG, WEBP — uploaded on submit
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && handleCoverSelect(e.target.files[0])
              }
            />
          </label>
        )}
      </div>

      {/* Gallery */}
      <div>
        <h3 className="text-sm font-semibold text-navy-200 mb-3 uppercase tracking-wide">
          Gallery ({(data.gallery_image_urls ?? []).length}/10)
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {(data.gallery_image_urls ?? []).map((url: string, idx: number) => (
            <div
              key={url}
              className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group"
            >
              <img
                src={url}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {(data.gallery_image_urls ?? []).length < 10 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-ocean-400 hover:bg-ocean-500/5 transition-all">
              <Upload className="w-6 h-6 text-navy-400" />
              <span className="text-xs text-navy-400">Add photos</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) =>
                  e.target.files && handleGallerySelect(e.target.files)
                }
              />
            </label>
          )}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

// Step 8 - Contact
function Step8Contact({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: any;
  onChange: (v: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const formik = useFormik({
    initialValues: {
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      website_url: data.website_url,
    },
    validationSchema: step8Schema,
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <StepHeader
        icon={Phone}
        title="Contact Information"
        subtitle="How should boaters and our team reach you?"
      />

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Contact Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="contact_name"
                placeholder="Jane Smith"
                value={formik.values.contact_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
            {formik.touched.contact_name && formik.errors.contact_name && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.contact_name)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Contact Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="contact_email"
                type="email"
                placeholder="contact@marina.com"
                value={formik.values.contact_email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
            {formik.touched.contact_email && formik.errors.contact_email && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.contact_email)}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="contact_phone"
                placeholder="+1 305 555 0100"
                value={formik.values.contact_phone}
                onChange={formik.handleChange}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="website_url"
                placeholder="https://yourmarina.com"
                value={formik.values.website_url}
                onChange={formik.handleChange}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
          </div>
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() => formik.handleSubmit()}
        nextLabel="Continue"
      />
    </form>
  );
}

// Step 9 - Host Account
function Step9HostAccount({
  data,
  onChange,
  onBack,
  onNext,
}: {
  data: any;
  onChange: (v: any) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const formik = useFormik({
    initialValues: {
      host_name: data.host_name,
      host_email: data.host_email,
      host_phone: data.host_phone,
      company_name: data.company_name,
    },
    validationSchema: step9Schema,
    onSubmit: (values) => {
      onChange(values);
      onNext();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <StepHeader
        icon={User}
        title="Your Host Account"
        subtitle="We'll create your host account and send login details to your email."
      />

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="host_name"
                placeholder="Your full name"
                value={formik.values.host_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
            {formik.touched.host_name && formik.errors.host_name && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.host_name)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="host_email"
                type="email"
                placeholder="you@example.com"
                value={formik.values.host_email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
            {formik.touched.host_email && formik.errors.host_email && (
              <p className="text-red-400 text-xs mt-1">
                {String(formik.errors.host_email)}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="host_phone"
                placeholder="+1 305 555 0100"
                value={formik.values.host_phone}
                onChange={formik.handleChange}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-200 mb-2">
              Company / Organization
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" />
              <Input
                name="company_name"
                placeholder="Acme Marina Group"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-navy-500 h-12 rounded-xl focus-visible:ring-ocean-500"
              />
            </div>
          </div>
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={() => formik.handleSubmit()}
        nextLabel="Review & Submit →"
      />
    </form>
  );
}

// Step 10 - Review & Submit
function Step10Review({
  data,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  data: any;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const businessType =
    BUSINESS_TYPES.find((b) => b.id === data.business_type_id)?.label ??
    "Marina";
  const seabedType =
    SEABED_TYPES.find((s) => s.id === data.seabed_type_id) ?? null;
  const enabledFeatures = FEATURES.filter(
    (f) => data[f.key as keyof typeof data],
  );
  const selectedAmenities = AMENITIES.filter((a) =>
    data.amenity_ids.includes(a.id),
  );

  return (
    <div>
      <StepHeader
        icon={FileCheck}
        title="Review Your Listing"
        subtitle="Everything looks good? Submit and we'll review your application within 1–2 business days."
      />

      <div className="space-y-5">
        {/* Venue */}
        <ReviewSection title="Venue" icon={Anchor}>
          <ReviewRow label="Type" value={businessType} />
          <ReviewRow label="Name" value={data.name} />
          <ReviewRow label="Price" value={`$${data.price_per_day} / day`} />
          <ReviewRow label="Total Slips" value={data.total_slips} />
          <div>
            <p className="text-xs text-navy-400 mb-1 uppercase tracking-wide font-semibold">
              Description
            </p>
            <p className="text-sm text-navy-200 leading-relaxed">
              {data.description}
            </p>
          </div>
        </ReviewSection>

        {/* Location */}
        <ReviewSection title="Location" icon={MapPin}>
          {data.address && <ReviewRow label="Address" value={data.address} />}
          <ReviewRow
            label="City"
            value={[data.city, data.state, data.country]
              .filter(Boolean)
              .join(", ")}
          />
          {data.postal_code && (
            <ReviewRow label="Postal Code" value={data.postal_code} />
          )}
          <ReviewRow
            label="Coordinates"
            value={`${data.latitude}, ${data.longitude}`}
          />
        </ReviewSection>

        {/* Facilities */}
        <ReviewSection title="Facilities" icon={Warehouse}>
          {data.max_boat_length_meters && (
            <ReviewRow
              label="Max Boat Length"
              value={`${data.max_boat_length_meters} m`}
            />
          )}
          {data.max_boat_draft_meters && (
            <ReviewRow
              label="Max Draft"
              value={`${data.max_boat_draft_meters} m`}
            />
          )}
          {enabledFeatures.length > 0 && (
            <div>
              <p className="text-xs text-navy-400 mb-2 uppercase tracking-wide font-semibold">
                Features
              </p>
              <div className="flex flex-wrap gap-2">
                {enabledFeatures.map((f) => (
                  <span
                    key={f.key}
                    className="text-xs font-semibold bg-ocean-500/15 text-ocean-300 border border-ocean-500/20 rounded-full px-3 py-1"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ReviewSection>

        {/* Amenities */}
        {selectedAmenities.length > 0 && (
          <ReviewSection title="Amenities" icon={Waves}>
            <div className="flex flex-wrap gap-2">
              {selectedAmenities.map((a) => (
                <span
                  key={a.id}
                  className="text-xs font-semibold bg-white/5 text-navy-200 border border-white/10 rounded-full px-3 py-1"
                >
                  {a.label}
                </span>
              ))}
            </div>
          </ReviewSection>
        )}

        {/* Seabed */}
        {seabedType && (
          <ReviewSection title="Seabed" icon={Layers}>
            <ReviewRow
              label="Type"
              value={
                <span className="flex items-center gap-2">
                  {(() => {
                    const SbIcon = seabedType.icon;
                    return (
                      <SbIcon className={`w-4 h-4 ${seabedType.iconColor}`} />
                    );
                  })()}
                  <span>{seabedType.label}</span>
                  <span className={`text-xs ${seabedType.holdingColor}`}>
                    ({seabedType.holding} hold)
                  </span>
                </span>
              }
            />
            {data.seabed_depth_meters && (
              <ReviewRow
                label="Depth"
                value={`${data.seabed_depth_meters} m`}
              />
            )}
            {data.seabed_description && (
              <ReviewRow label="Description" value={data.seabed_description} />
            )}
            {data.seabed_notes && (
              <ReviewRow label="Notes" value={data.seabed_notes} />
            )}
          </ReviewSection>
        )}

        {/* Gallery */}
        {(data.cover_image_url || data.gallery_image_urls?.length > 0) && (
          <ReviewSection title="Photos" icon={ImageIcon}>
            {data.cover_image_url && (
              <div className="mb-3">
                <p className="text-xs text-navy-400 mb-2 uppercase tracking-wide font-semibold">
                  Cover Photo
                </p>
                <img
                  src={data.cover_image_url}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-xl border border-white/10"
                />
              </div>
            )}
            {data.gallery_image_urls?.length > 0 && (
              <div>
                <p className="text-xs text-navy-400 mb-2 uppercase tracking-wide font-semibold">
                  Gallery ({data.gallery_image_urls.length} photo
                  {data.gallery_image_urls.length !== 1 ? "s" : ""})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {data.gallery_image_urls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="aspect-square object-cover rounded-lg border border-white/10"
                    />
                  ))}
                </div>
              </div>
            )}
          </ReviewSection>
        )}

        {/* Contact */}
        <ReviewSection title="Contact" icon={Phone}>
          <ReviewRow label="Name" value={data.contact_name} />
          <ReviewRow label="Email" value={data.contact_email} />
          {data.contact_phone && (
            <ReviewRow label="Phone" value={data.contact_phone} />
          )}
          {data.website_url && (
            <ReviewRow label="Website" value={data.website_url} />
          )}
        </ReviewSection>

        {/* Host Account */}
        <ReviewSection title="Your Account" icon={User}>
          <ReviewRow label="Name" value={data.host_name} />
          <ReviewRow label="Email" value={data.host_email} />
          {data.host_phone && (
            <ReviewRow label="Phone" value={data.host_phone} />
          )}
          {data.company_name && (
            <ReviewRow label="Company" value={data.company_name} />
          )}
        </ReviewSection>

        {/* Review notice */}
        <div className="bg-ocean-500/10 border border-ocean-500/20 rounded-2xl p-5 flex gap-4">
          <Shield className="w-6 h-6 text-ocean-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-1">
              Your listing will be reviewed before going live
            </p>
            <p className="text-navy-300 text-sm leading-relaxed">
              Once approved (usually 1–2 business days), you'll receive a
              welcome email with your host portal credentials.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      <NavButtons onBack={onBack} onSubmit={onSubmit} submitting={submitting} />
    </div>
  );
}

function ReviewSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <Icon className="w-4 h-4 text-ocean-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-navy-400 font-semibold uppercase tracking-wide shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-sm text-navy-100 text-right">{value}</span>
    </div>
  );
}

export default BecomeHost;
