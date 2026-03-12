import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Check,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import { CountrySelector } from "@/components/ui/country-selector";
import { parsePhoneNumber } from "libphonenumber-js";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  checkGuest,
  sendGuestCode,
  registerGuest,
  verifyGuestCode,
  clearError,
} from "@/store/slices/authSlice";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type Step = "email" | "verify" | "register";

const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { userId, userExists, isLoading, error, user, isAuthenticated } =
    useAppSelector((state) => state.auth);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    countryCode: "US",
  });
  const [phoneError, setPhoneError] = useState("");
  const [dobError, setDobError] = useState("");

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  // Handle successful authentication
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      onSuccess(user);
    }
  }, [isOpen, isAuthenticated, user, onSuccess]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(checkGuest(email));

    if (checkGuest.fulfilled.match(result)) {
      if (result.payload.exists && result.payload.userId) {
        // User exists - send code and go to verify
        await dispatch(sendGuestCode({ userId: result.payload.userId, email }));
        setStep("verify");
      } else {
        // User doesn't exist - go to register step
        setStep("register");
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
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

      // Focus the last filled input or next empty one
      const nextIndex = Math.min(digits.length, 5);
      const nextInput = document.getElementById(`code-${nextIndex}`);
      nextInput?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeString = code.join("");

    if (userId) {
      // User exists or was just registered - verify the code
      await dispatch(verifyGuestCode({ userId, code: codeString }));
    } else {
      // This should not happen with the new flow, but fallback
      console.error("No userId available for verification");
    }
  };

  // Validate age (must be 18+)
  const validateAge = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) {
      setDobError("Date of birth is required");
      return false;
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setDobError("You must be at least 18 years old");
      return false;
    }

    setDobError("");
    return true;
  };

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }

    try {
      const phoneNumber = parsePhoneNumber(phone);
      if (!phoneNumber || !phoneNumber.isValid()) {
        setPhoneError("Please enter a valid phone number");
        return false;
      }
      setPhoneError("");
      return true;
    } catch {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isPhoneValid = validatePhone(userInfo.phone);
    const isAgeValid = validateAge(userInfo.dateOfBirth);

    if (!isPhoneValid || !isAgeValid) {
      return;
    }

    // Parse phone number to get country code and national number
    let phoneCode = "";
    let nationalNumber = "";

    try {
      const phoneNumber = parsePhoneNumber(userInfo.phone);
      if (phoneNumber) {
        phoneCode = `+${phoneNumber.countryCallingCode}`;
        nationalNumber = phoneNumber.nationalNumber;
      }
    } catch (error) {
      console.error("Error parsing phone number:", error);
    }

    // Register new user
    const registerResult = await dispatch(
      registerGuest({
        email,
        fullName: userInfo.name,
        phone: nationalNumber || userInfo.phone,
        phoneCode,
        countryCode: userInfo.countryCode,
        dateOfBirth: userInfo.dateOfBirth,
      }),
    );

    if (
      registerGuest.fulfilled.match(registerResult) &&
      registerResult.payload.userId
    ) {
      // Send verification code to new user
      const sendCodeResult = await dispatch(
        sendGuestCode({
          userId: registerResult.payload.userId,
          email,
        }),
      );

      if (sendGuestCode.fulfilled.match(sendCodeResult)) {
        // Clear any previous code and go to verify step
        setCode(["", "", "", "", "", ""]);
        setStep("verify");
      }
    }
  };

  const handleReset = () => {
    setStep("email");
    setEmail("");
    setCode(["", "", "", "", "", ""]);
    setUserInfo({ name: "", phone: "", dateOfBirth: "", countryCode: "US" });
    setPhoneError("");
    setDobError("");
    dispatch(clearError());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {step === "email" && <Mail className="h-6 w-6" />}
                  {step === "verify" && <Lock className="h-6 w-6" />}
                  {step === "register" && <User className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {step === "email" && "Sign in to continue"}
                    {step === "verify" && "Verify your email"}
                    {step === "register" && "Complete your profile"}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {step === "email" && "Book your slip in seconds"}
                    {step === "verify" && "Enter the code we sent you"}
                    {step === "register" && "Just a few more details"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Email */}
                {step === "email" && (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-2 h-12"
                        required
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-12 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        <>Continue with email</>
                      )}
                    </Button>

                    <div className="p-3 bg-ocean-50 border border-ocean-200 rounded-lg">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong className="text-ocean-700">
                          Why a one-time code?
                        </strong>{" "}
                        We use passwordless authentication for your security and
                        convenience. No passwords to remember or manage – just
                        enter your email and we'll send you a secure code.
                      </p>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                      We'll send you a verification code
                    </p>
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
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-gray-600 text-sm mb-4">
                        We sent a 6-digit code to <strong>{email}</strong>
                      </p>

                      <div className="flex gap-2 justify-center">
                        {code.map((digit, index) => (
                          <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleCodeChange(index, e.target.value)
                            }
                            onPaste={handlePaste}
                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 transition-all"
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || code.some((d) => !d)}
                      className="w-full h-12 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>Verify code</>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                    >
                      Use different email
                    </button>
                  </motion.form>
                )}

                {/* Step 3: Register */}
                {step === "register" && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700 text-sm">
                      <User className="h-5 w-5" />
                      <span>Welcome! Let's create your account.</span>
                    </div>

                    <div>
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        Full name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={userInfo.name}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="mt-2 h-12"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="dateOfBirth"
                        className="text-gray-700 font-medium"
                      >
                        Date of birth
                        <span className="text-xs text-gray-500 ml-2">
                          (Must be 18 or older)
                        </span>
                      </Label>
                      <DateOfBirthInput
                        value={userInfo.dateOfBirth}
                        onChange={(date) =>
                          setUserInfo({ ...userInfo, dateOfBirth: date })
                        }
                        error={dobError}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="country"
                        className="text-gray-700 font-medium"
                      >
                        Country
                      </Label>
                      <CountrySelector
                        value={userInfo.countryCode}
                        onValueChange={(value) =>
                          setUserInfo({ ...userInfo, countryCode: value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        Phone number
                      </Label>
                      <CustomPhoneInput
                        value={userInfo.phone}
                        onChange={(value) => {
                          setUserInfo({ ...userInfo, phone: value || "" });
                          if (phoneError) setPhoneError("");
                        }}
                        placeholder="Enter your phone number"
                        defaultCountry={userInfo.countryCode as any}
                        className="mt-2"
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !userInfo.name ||
                        !userInfo.phone ||
                        !userInfo.dateOfBirth ||
                        !userInfo.countryCode ||
                        phoneError !== "" ||
                        dobError !== ""
                      }
                      className="w-full h-12 bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800 text-white font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>Complete signup</>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignInModal;
