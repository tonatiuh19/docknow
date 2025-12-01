"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CountryPicker, { Country } from "./CountryPicker";
import PhonePicker, { PhoneCode } from "./PhonePicker";
import { useStore } from "@/store/store";
import { IoClose, IoMail, IoCheckmarkCircle } from "react-icons/io5";
import {
  FaUserCircle,
  FaPhone,
  FaCalendar,
  FaShip,
  FaAnchor,
} from "react-icons/fa";
import { MdLocationOn, MdWarning } from "react-icons/md";
import { HiMail } from "react-icons/hi";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "register" | "verify";

interface FormData {
  email: string;
  fullName: string;
  phone: string;
  phoneCode: string;
  countryCode: string;
  dateOfBirth: string;
}

interface FormErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  phoneCode?: string;
  countryCode?: string;
  dateOfBirth?: string;
  code?: string;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullName: "",
    phone: "",
    phoneCode: "+52",
    countryCode: "MX",
    dateOfBirth: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Use separate selectors to avoid object recreation
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (step === "email" || step === "register") {
      if (!formData.email) {
        errors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        errors.email = "Invalid email format";
      }
    }

    if (step === "register") {
      if (!formData.fullName.trim()) {
        errors.fullName = "Full name is required";
      }

      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      }

      if (!formData.phoneCode) {
        errors.phoneCode = "Phone code is required";
      }

      if (!formData.countryCode) {
        errors.countryCode = "Country is required";
      }

      if (!formData.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required";
      } else {
        const age = calculateAge(formData.dateOfBirth);
        if (age < 18) {
          errors.dateOfBirth = "You must be at least 18 years old";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/check-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          // User exists, send verification code
          setUserId(data.userId);
          await sendVerificationCode(data.userId);
        } else {
          // User doesn't exist, go to registration
          setStep("register");
        }
      } else {
        setError(data.error || "Failed to check email");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          phoneCode: formData.phoneCode,
          countryCode: formData.countryCode,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        await sendVerificationCode(data.userId);
      } else {
        setError(data.error || "Failed to register");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (id: number) => {
    try {
      const response = await fetch("/api/auth/send-guest-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("verify");
        setResendTimer(300); // 5 minutes = 300 seconds
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (err) {
      setError("Failed to send verification code");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setFormErrors({ code: "Code must be 6 digits" });
      return;
    }

    setLoading(true);
    setError("");
    setFormErrors({});

    try {
      const response = await fetch("/api/auth/verify-guest-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set user and token in store
        setUser(data.user);
        setToken(data.token);
        onClose();
      } else {
        setFormErrors({ code: data.error || "Invalid verification code" });
      }
    } catch (err) {
      setFormErrors({ code: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setStep("email");
    setFormData({
      email: "",
      fullName: "",
      phone: "",
      phoneCode: "+52",
      countryCode: "MX",
      dateOfBirth: "",
    });
    setFormErrors({});
    setVerificationCode("");
    setError("");
    setUserId(null);
    setResendTimer(0);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Animated Backdrop */}
      <div
        className="fixed inset-0 z-[99998] bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-md transition-all duration-500 ease-out animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md transform transition-all duration-500 ease-out scale-100 my-auto z-[99999] animate-slide-up">
        {/* Gradient Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-50 animate-pulse" />

        {/* Main Modal */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Decorative Top Pattern */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

          {/* Header */}
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-all duration-300 hover:rotate-90 hover:scale-110 group active:scale-95"
            >
              <IoClose className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-200" />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center mb-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/50 hover:shadow-2xl animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                {step === "email" && (
                  <IoMail className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-slide-up" />
                )}
                {step === "register" && (
                  <FaUserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-slide-up" />
                )}
                {step === "verify" && (
                  <IoCheckmarkCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-slide-up" />
                )}
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                {step === "email" && (
                  <>
                    Welcome Aboard! <FaShip className="w-6 h-6" />
                  </>
                )}
                {step === "register" && (
                  <>
                    Almost There! <FaAnchor className="w-6 h-6" />
                  </>
                )}
                {step === "verify" && (
                  <>
                    Check Your Email <HiMail className="w-6 h-6" />
                  </>
                )}
              </h2>

              <p
                className="text-sm sm:text-base text-gray-300 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                {step === "email" && "Enter your email to start your journey"}
                {step === "register" && "Just a few details to get you sailing"}
                {step === "verify" && "We sent a code to your inbox"}
              </p>
            </div>

            {/* Progress Indicator */}
            <div
              className="flex justify-center gap-2 mt-6 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div
                className={`h-1.5 w-12 rounded-full transition-all duration-500 ease-out ${
                  step === "email"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-gray-600 scale-100"
                }`}
              />
              <div
                className={`h-1.5 w-12 rounded-full transition-all duration-500 ease-out ${
                  step === "register"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-gray-600 scale-100"
                }`}
              />
              <div
                className={`h-1.5 w-12 rounded-full transition-all duration-500 ease-out ${
                  step === "verify"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-gray-600 scale-100"
                }`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <MdWarning className="w-5 h-5 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}
            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <IoMail className="w-4 h-4 text-cyan-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-4 py-3.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 hover:bg-gray-700/70 ${
                        formErrors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50 animate-shake"
                          : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50 focus:shadow-lg focus:shadow-cyan-500/20"
                      }`}
                      placeholder="your@email.com"
                      disabled={loading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/50 hover:shadow-2xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    "Continue →"
                  )}
                </button>
              </form>
            )}
            {/* Register Step */}
            {step === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaUserCircle className="w-4 h-4 text-cyan-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={`w-full px-4 py-3.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.fullName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50"
                    }`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                  {formErrors.fullName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <PhonePicker
                      value={formData.phoneCode}
                      onChange={(phoneCode: PhoneCode) =>
                        setFormData({ ...formData, phoneCode: phoneCode.dial })
                      }
                      error={formErrors.phoneCode}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-cyan-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`w-full px-4 py-3.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        formErrors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                          : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50"
                      }`}
                      placeholder="1234567890"
                      disabled={loading}
                    />
                    {formErrors.phone && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <CountryPicker
                  value={formData.countryCode}
                  onChange={(country: Country) =>
                    setFormData({ ...formData, countryCode: country.code })
                  }
                  error={formErrors.countryCode}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaCalendar className="w-4 h-4 text-cyan-400" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.dateOfBirth
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
                    }`}
                    disabled={loading}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formErrors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex-1 py-4 px-4 bg-gray-700/50 text-white font-semibold rounded-xl hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      "Continue →"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Verify Step */}
            {step === "verify" && (
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center justify-center gap-2">
                    <IoCheckmarkCircle className="w-4 h-4 text-cyan-400" />
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setVerificationCode(value);
                    }}
                    className={`w-full px-4 py-4 bg-gray-700/50 border rounded-xl text-white text-center text-3xl font-mono tracking-[0.5em] placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.code
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50 animate-shake"
                        : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50"
                    }`}
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                    autoComplete="off"
                  />
                  {formErrors.code && (
                    <p className="mt-2 text-sm text-red-400 text-center flex items-center justify-center gap-1 animate-shake">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formErrors.code}
                    </p>
                  )}

                  {/* Info Messages */}
                  <div className="mt-3 space-y-2">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <p className="text-xs text-cyan-300 text-center flex items-center justify-center gap-2">
                        <IoMail className="w-4 h-4 flex-shrink-0" />
                        <span>Check your email for the 6-digit code</span>
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-300 text-center flex items-center justify-center gap-2">
                        <MdWarning className="w-4 h-4 flex-shrink-0" />
                        <span>Don't forget to check your spam folder</span>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Sign In ✓"
                  )}
                </button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <div className="py-3 text-sm text-gray-400">
                      <p className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Resend available in {Math.floor(resendTimer / 60)}:
                        {String(resendTimer % 60).padStart(2, "0")}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => userId && sendVerificationCode(userId)}
                      className="w-full py-3 text-sm text-cyan-400 hover:text-cyan-300 transition-all font-medium hover:underline decoration-2 underline-offset-4"
                      disabled={loading}
                    >
                      Didn't receive it? Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
