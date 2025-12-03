"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { FaChartLine, FaShip, FaDollarSign } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

export default function HostLoginPage() {
  const router = useRouter();
  const { sendHostCode, hostLogin, hostAuthLoading } = useStore();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await sendHostCode(email);
      setStep("code");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send verification code");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await hostLogin(email, code);
      router.push("/host/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to verify code");
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
  };

  return (
    <>
      <MetaHelmet
        title="Host Login | DockNow"
        description="Sign in to your DockNow marina host dashboard"
        noindex={true}
        nofollow={true}
      />
      <div className="h-screen flex">
        {/* Left Column - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-ocean-800 to-ocean-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-ocean-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
            <div className="flex items-center space-x-3 mb-8">
              <Image
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="DockNow Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>

            <h1 className="text-4xl font-bold text-center mb-6">
              Marina Host Portal
            </h1>

            <p className="text-xl text-center text-ocean-100 max-w-md mb-12">
              Manage your marina, bookings, and guests all in one powerful
              platform
            </p>

            <div className="grid grid-cols-1 gap-6 max-w-md w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="mb-2">
                  <FaChartLine className="h-8 w-8 text-ocean-300" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  Real-time Analytics
                </h3>
                <p className="text-ocean-100 text-sm">
                  Track bookings, revenue, and occupancy rates
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="mb-2">
                  <FaShip className="h-8 w-8 text-ocean-300" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Slip Management</h3>
                <p className="text-ocean-100 text-sm">
                  Manage availability, pricing, and amenities
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="mb-2">
                  <FaDollarSign className="h-8 w-8 text-ocean-300" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Payment Tracking</h3>
                <p className="text-ocean-100 text-sm">
                  Monitor payments and financial reports
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center space-x-2 mb-8">
              <Image
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="DockNow Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-navy-900 mb-2">
                  {step === "email" ? "Welcome Back" : "Verify Your Code"}
                </h2>
                <p className="text-gray-600">
                  {step === "email"
                    ? "Sign in to access your marina dashboard"
                    : "Enter the verification code sent to your email"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="host@marina.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={hostAuthLoading === "loading"}
                    className="w-full bg-gradient-to-r from-ocean-600 to-ocean-500 text-white py-3 rounded-lg font-semibold hover:from-ocean-700 hover:to-ocean-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {hostAuthLoading === "loading" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition text-center text-2xl tracking-widest font-mono"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Code sent to: <span className="font-medium">{email}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={hostAuthLoading === "loading"}
                    className="w-full bg-gradient-to-r from-ocean-600 to-ocean-500 text-white py-3 rounded-lg font-semibold hover:from-ocean-700 hover:to-ocean-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {hostAuthLoading === "loading" ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Verify & Sign In"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="w-full text-ocean-600 py-2 rounded-lg font-medium hover:bg-ocean-50 transition"
                  >
                    Back to Email
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-900 mb-1">
                        Secure Passwordless Authentication
                      </h4>
                      <p className="text-xs text-green-700 leading-relaxed">
                        We use one-time verification codes sent directly to your
                        email. No passwords to remember or compromise. Each code
                        expires in 15 minutes and can only be used once,
                        ensuring maximum security for your marina dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-600">
                  Need help?{" "}
                  <a
                    href="mailto:support@docknow.app"
                    className="text-ocean-600 hover:text-ocean-700 font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Not a host?{" "}
              <a
                href="/"
                className="text-ocean-600 hover:text-ocean-700 font-medium"
              >
                Go to Guest Portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
