import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Anchor,
  ChevronRight,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendHostCode,
  verifyHostCode,
  clearHostError,
  checkHostAuth,
} from "@/store/slices/hostAuthSlice";
import MetaHelmet from "@/components/MetaHelmet";

type Step = "email" | "verify";

const HostLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.hostAuth,
  );

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check if host is already authenticated on component mount
    dispatch(checkHostAuth());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearHostError());
  }, [dispatch]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(sendHostCode(email));
    if (sendHostCode.fulfilled.match(result)) {
      setStep("verify");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`host-code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);

      const nextIndex = Math.min(digits.length, 5);
      const nextInput = document.getElementById(`host-code-${nextIndex}`);
      nextInput?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeString = code.join("");
    await dispatch(verifyHostCode({ email, code: codeString }));
  };

  const handleReset = () => {
    setStep("email");
    setEmail("");
    setCode(["", "", "", "", "", ""]);
    dispatch(clearHostError());
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Revenue Analytics",
      description: "Real-time insights into your marina performance",
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Track and manage all your bookings in one place",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for your business",
    },
  ];

  return (
    <>
      <MetaHelmet
        title="Host Login - DockNow"
        description="Access your marina management dashboard"
        noindex={true}
      />
      <div className="min-h-screen flex">
        {/* Left Column - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            animate={{
              x: [-20, 20],
              y: [-10, 10],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-r from-ocean-500 to-blue-500 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              x: [20, -20],
              y: [10, -10],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
              delay: 2,
            }}
            className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-l from-purple-500 to-ocean-400 rounded-full blur-[100px]"
          />

          <div className="relative z-10 flex flex-col justify-center px-16 py-12">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="https://garbrix.com/navios/assets/images/logo.png"
                  alt="DockNow"
                  className="w-24 h-14 object-contain"
                />
              </div>
            </motion.div>

            {/* Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Manage Your Marina
                <br />
                <span className="text-ocean-300">With Confidence</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Access powerful tools to manage bookings, track revenue, and
                grow your marina business.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-ocean-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-ocean-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="DockNow"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-navy-900">DockNow</h1>
                <p className="text-navy-500 text-sm">Host Dashboard</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-navy-900 mb-2">
                {step === "email" ? "Welcome back" : "Verify your email"}
              </h2>
              <p className="text-navy-600">
                {step === "email"
                  ? "Sign in to your host dashboard"
                  : "Enter the code we sent to your email"}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-red-300 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {step === "email" && (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-6"
                >
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-navy-700 font-semibold text-sm mb-2 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Host Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@marina.com"
                      className="h-14 text-lg border-navy-200 focus:border-ocean-500 focus:ring-ocean-500"
                      required
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-14 bg-gradient-ocean hover:shadow-glow text-white font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-navy-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-navy-500">
                        Secure host login
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">
                          Host-only access
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Only registered marina hosts can access the dashboard.
                          If your email is not recognized, please contact
                          support.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Step 2: Verify Code */}
              {step === "verify" && (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyCode}
                  className="space-y-6"
                >
                  <div className="p-4 bg-ocean-50 border border-ocean-200 rounded-xl mb-6">
                    <p className="text-navy-700 text-sm">
                      We sent a 6-digit code to{" "}
                      <strong className="text-navy-900">{email}</strong>
                    </p>
                  </div>

                  <div>
                    <Label className="text-navy-700 font-semibold text-sm mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Verification Code
                    </Label>
                    <div className="flex gap-3 justify-center">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          id={`host-code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(index, e.target.value)
                          }
                          onPaste={handlePaste}
                          className="w-14 h-16 text-center text-2xl font-bold border-2 border-navy-200 rounded-xl focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all outline-none"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || code.some((d) => !d)}
                    className="w-full h-14 bg-gradient-ocean hover:shadow-glow text-white font-bold text-lg rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Access Dashboard
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full text-sm text-ocean-600 hover:text-ocean-700 font-medium py-2"
                  >
                    Use different email
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default HostLogin;
