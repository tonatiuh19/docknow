"use client";

import { FaPlus, FaLightbulb, FaRocket } from "react-icons/fa";

export default function FeaturesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Add Features</h1>
        <p className="text-gray-600">
          Request new features or manage custom integrations
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
          <FaLightbulb className="h-10 w-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-navy-900 mb-2">
          Feature Requests
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Have an idea for a new feature? Let us know and we'll work with you to
          make it happen.
        </p>
        <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition">
          <FaPlus className="h-5 w-5" />
          <span>Submit Feature Request</span>
        </button>
      </div>
    </div>
  );
}
