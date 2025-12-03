"use client";

import { useStore } from "@/store/store";
import { FaUser, FaBell, FaLock, FaCreditCard } from "react-icons/fa";

export default function SettingsPage() {
  const { host } = useStore();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-ocean-100 rounded-lg mr-3">
              <FaUser className="h-5 w-5 text-ocean-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">
              Profile Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={host?.full_name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={host?.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={host?.phone}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                defaultValue={host?.company_name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <FaBell className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">New booking notifications</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-ocean-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Payment confirmations</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-ocean-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Guest messages</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-ocean-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <FaLock className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">Security</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Manage your security preferences and authentication settings
          </p>
          <button className="text-ocean-600 hover:text-ocean-700 font-medium">
            Change verification email →
          </button>
        </div>
      </div>
    </div>
  );
}
