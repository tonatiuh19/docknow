import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bell,
  BellOff,
  Globe,
} from "lucide-react";
import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CountrySelector } from "@/components/ui/country-selector";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  updateProfile,
  clearError,
  clearUpdateSuccess,
} from "@/store/slices/profileSlice";
import { parsePhoneNumber, CountryCode } from "libphonenumber-js";

const validationSchema = Yup.object({
  full_name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .required("Full name is required"),
  phone: Yup.string()
    .test("is-valid-phone", "Please enter a valid phone number", (value) => {
      if (!value) return true; // Phone is optional
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber ? phoneNumber.isValid() : false;
      } catch {
        return false;
      }
    })
    .nullable(),
  date_of_birth: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .nullable(),
  general_notifications: Yup.boolean(),
  marketing_notifications: Yup.boolean(),
});

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, isLoading, isUpdating, error, updateSuccess } =
    useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Debug: Log profile data when it changes
  useEffect(() => {
    if (profile) {
      console.log("Profile data loaded:", profile);
    }
  }, [profile]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearUpdateSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  // Combine phone_code and phone into international format
  const getFullPhoneNumber = () => {
    if (!profile?.phone || !profile?.phone_code) return "";
    return `${profile.phone_code}${profile.phone}`;
  };

  const formik = useFormik({
    initialValues: {
      full_name: profile?.full_name || "",
      phone: profile ? getFullPhoneNumber() : "",
      country_code: profile?.country_code || "",
      date_of_birth: profile?.date_of_birth || "",
      profile_image_url: profile?.profile_image_url || "",
      general_notifications: profile?.general_notifications ?? true,
      marketing_notifications: profile?.marketing_notifications ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      // Parse phone number to extract phone_code and phone
      let phone_code = "";
      let phone = "";
      let country_code = values.country_code;

      if (values.phone) {
        try {
          const phoneNumber = parsePhoneNumber(values.phone);
          if (phoneNumber && phoneNumber.isValid()) {
            phone_code = `+${phoneNumber.countryCallingCode}`;
            phone = phoneNumber.nationalNumber;
            country_code = phoneNumber.country || values.country_code;
          }
        } catch (error) {
          console.error("Phone parsing error:", error);
        }
      }

      dispatch(
        updateProfile({
          ...values,
          phone,
          phone_code,
          country_code,
        }),
      );
    },
  });

  const handlePhoneChange = (phone: string | undefined) => {
    formik.setFieldValue("phone", phone || "");

    // Auto-update country code based on phone number
    if (phone) {
      try {
        const phoneNumber = parsePhoneNumber(phone);
        if (phoneNumber && phoneNumber.country) {
          formik.setFieldValue("country_code", phoneNumber.country);
        }
      } catch (error) {
        // Ignore parsing errors while typing
      }
    }
  };

  const handleCountryChange = (countryCode: string) => {
    formik.setFieldValue("country_code", countryCode);
  };

  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      // Handle both YYYY-MM-DD and other formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-ocean-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading profile...
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch your data.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <MetaHelmet
        title="Profile Settings - DockNow"
        description="Update your profile information, manage notifications, and customize your DockNow experience."
        keywords="profile, settings, account, notifications, user preferences"
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
        noindex={true}
      />
      <div className="min-h-screen bg-navy-50/30">
        {/* Header */}
        <div className="relative bg-navy-950 pt-32 pb-20 overflow-hidden">
          <motion.div
            animate={{
              x: [-20, 20],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-[100px]"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4 text-white"
              >
                Profile Settings
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-ocean-100/80 max-w-2xl mx-auto"
              >
                Manage your account information and preferences.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Success Alert */}
            {updateSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your profile has been updated successfully!
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(clearError())}
                    className="ml-2 h-6 text-red-600 hover:text-red-700"
                  >
                    Dismiss
                  </Button>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-8">
              {/* Profile Information */}
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-navy-50 to-ocean-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold text-navy-900">
                    <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-ocean-600" />
                    </div>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-ocean-100 rounded-2xl flex items-center justify-center text-ocean-600 overflow-hidden">
                        {formik.values.profile_image_url ? (
                          <img
                            src={formik.values.profile_image_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 border-white shadow-md"
                        type="button"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-navy-900 mb-1">
                        {user?.full_name}
                      </h3>
                      <p className="text-navy-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-semibold text-navy-700"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formik.values.full_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`h-12 ${
                          formik.touched.full_name && formik.errors.full_name
                            ? "border-red-300"
                            : "border-navy-200"
                        }`}
                        placeholder="Enter your full name"
                      />
                      {formik.touched.full_name && formik.errors.full_name && (
                        <p className="text-sm text-red-600">
                          {formik.errors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="date_of_birth"
                        className="text-sm font-semibold text-navy-700"
                      >
                        Date of Birth
                      </Label>
                      <DateOfBirthInput
                        value={formatDateForDisplay(
                          formik.values.date_of_birth,
                        )}
                        onChange={(date) =>
                          formik.setFieldValue("date_of_birth", date)
                        }
                        error={
                          formik.touched.date_of_birth
                            ? formik.errors.date_of_birth
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-navy-700"
                    >
                      Phone Number
                    </Label>
                    <CustomPhoneInput
                      value={formik.values.phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter your phone number"
                      defaultCountry={
                        (formik.values.country_code as CountryCode) || "US"
                      }
                      className="mt-2"
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-sm text-red-600">
                        {formik.errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="text-sm font-semibold text-navy-700"
                    >
                      Country
                    </Label>
                    <CountrySelector
                      value={formik.values.country_code}
                      onValueChange={handleCountryChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-navy-50 to-ocean-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold text-navy-900">
                    <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
                      <Bell className="w-5 h-5 text-ocean-600" />
                    </div>
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-navy-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-navy-600" />
                      <div>
                        <h4 className="font-semibold text-navy-900">
                          General Notifications
                        </h4>
                        <p className="text-sm text-navy-500">
                          Booking confirmations, cancellations, and important
                          updates
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formik.values.general_notifications}
                      onCheckedChange={(checked) =>
                        formik.setFieldValue("general_notifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-navy-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-navy-600" />
                      <div>
                        <h4 className="font-semibold text-navy-900">
                          Marketing Notifications
                        </h4>
                        <p className="text-sm text-navy-500">
                          Special offers, new features, and marina
                          recommendations
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formik.values.marketing_notifications}
                      onCheckedChange={(checked) =>
                        formik.setFieldValue("marketing_notifications", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdating || !formik.isValid}
                  className="h-14 px-8 rounded-2xl bg-gradient-ocean hover:shadow-glow text-white border-none font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-3" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
