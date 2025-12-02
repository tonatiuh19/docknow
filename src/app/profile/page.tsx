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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-20 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <FiUser className="w-10 h-10 text-cyan-400" />
            Profile Settings
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/50 backdrop-blur-xl">
            <p className="text-green-400 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5" />
              {successMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 backdrop-blur-xl">
            <p className="text-red-400 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5" />
              {errorMessage}
            </p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiUser className="w-6 h-6 text-cyan-400" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative w-24">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="phone_code"
                      value={formData.phone_code}
                      onChange={handleChange}
                      className="w-full pl-10 pr-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="+52"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              {/* Country Code */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  >
                    <option value="MX" className="bg-gray-900">
                      Mexico
                    </option>
                    <option value="US" className="bg-gray-900">
                      United States
                    </option>
                    <option value="CA" className="bg-gray-900">
                      Canada
                    </option>
                  </select>
                </div>
              </div>

              {/* Profile Image URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Image URL
                </label>
                <div className="relative">
                  <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="profile_image_url"
                    value={formData.profile_image_url}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FiBell className="w-6 h-6 text-cyan-400" />
              Notification Preferences
            </h2>

            <div className="space-y-4">
              {/* General Notifications */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h3 className="text-white font-medium">
                    General Notifications
                  </h3>
                  <p className="text-sm text-gray-400">
                    Receive booking confirmations and important updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="general_notifications"
                    checked={formData.general_notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Marketing Notifications */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h3 className="text-white font-medium">
                    Marketing Notifications
                  </h3>
                  <p className="text-sm text-gray-400">
                    Receive promotional offers and marina recommendations
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketing_notifications"
                    checked={formData.marketing_notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
