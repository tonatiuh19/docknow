"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiGlobe,
  FiImage,
  FiBell,
  FiSave,
  FiAlertCircle,
} from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const profile = useStore((state) => state.profile);
  const isLoading = useStore((state) => state.isLoading);
  const fetchProfile = useStore((state) => state.fetchProfile);
  const updateProfile = useStore((state) => state.updateProfile);

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    phone: "",
    phone_code: "+52",
    country_code: "MX",
    profile_image_url: "",
    general_notifications: true,
    marketing_notifications: true,
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token && !isAuthenticated) {
      router.push("/");
      return;
    }

    fetchProfile();
  }, [isAuthenticated, router, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString().split("T")[0]
          : "",
        phone: profile.phone || "",
        phone_code: profile.phone_code || "+52",
        country_code: profile.country_code || "MX",
        profile_image_url: profile.profile_image_url || "",
        general_notifications: profile.general_notifications,
        marketing_notifications: profile.marketing_notifications,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await updateProfile(formData);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full border-4 border-cyan-300 opacity-20"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-slate-50">
      <Header />

      {/* Professional Gradient Header Section - Similar to Admin Ports */}
      <div className="relative bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 py-16 mt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-slate-900/80 via-cyan-900/80 to-blue-900/80"></div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-cyan-500/20 rounded-3xl backdrop-blur-xl border border-cyan-400/30">
              <FiUser className="w-12 h-12 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-cyan-100 text-lg">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl -mt-8 relative z-10">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-xl shadow-lg">
            <p className="text-green-700 font-semibold flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-white" />
              </div>
              {successMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 backdrop-blur-xl shadow-lg">
            <p className="text-red-700 font-semibold flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-white" />
              </div>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Card */}
          <div className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-10 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Full Name *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  Email address cannot be changed
                </p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Date of Birth
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiCalendar className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="relative w-28 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiPhone className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="phone_code"
                      value={formData.phone_code}
                      onChange={handleChange}
                      className="w-full pl-11 pr-2 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      placeholder="+52"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              {/* Country Code */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Country
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiGlobe className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="MX" className="bg-white">
                      🇲🇽 Mexico
                    </option>
                    <option value="US" className="bg-white">
                      🇺🇸 United States
                    </option>
                    <option value="CA" className="bg-white">
                      🇨🇦 Canada
                    </option>
                  </select>
                </div>
              </div>

              {/* Profile Image URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Profile Image URL
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiImage className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    name="profile_image_url"
                    value={formData.profile_image_url}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-10 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
                <FiBell className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Notification Preferences
              </h2>
            </div>

            <div className="space-y-5">
              {/* General Notifications */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-cyan-50/30 rounded-2xl border-2 border-slate-100 hover:border-cyan-200 transition-all">
                <div className="flex-1">
                  <h3 className="text-slate-900 font-bold text-lg mb-1">
                    General Notifications
                  </h3>
                  <p className="text-sm text-slate-600">
                    Receive booking confirmations and important updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    name="general_notifications"
                    checked={formData.general_notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 shadow-inner"></div>
                </label>
              </div>

              {/* Marketing Notifications */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border-2 border-slate-100 hover:border-cyan-200 transition-all">
                <div className="flex-1">
                  <h3 className="text-slate-900 font-bold text-lg mb-1">
                    Marketing Notifications
                  </h3>
                  <p className="text-sm text-slate-600">
                    Receive promotional offers and marina recommendations
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    name="marketing_notifications"
                    checked={formData.marketing_notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 shadow-inner"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden group hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-cyan-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"></div>
              {saving ? (
                <span className="relative z-10 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  Saving Changes...
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-3">
                  <FiSave className="w-6 h-6" />
                  Save Changes
                </span>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
