"use client";

import MetaHelmet from "@/components/MetaHelmet";
import {
  FaHeadset,
  FaEnvelope,
  FaPhone,
  FaQuestionCircle,
} from "react-icons/fa";

export default function SupportPage() {
  return (
    <>
      <MetaHelmet
        title="Support | DockNow Host"
        description="Get help and contact our support team"
        noindex={true}
        nofollow={true}
      />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Support</h1>
          <p className="text-gray-600">Get help and contact our support team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="p-3 bg-ocean-100 rounded-lg w-fit mb-4">
              <FaEnvelope className="h-6 w-6 text-ocean-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">
              Email Support
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Send us an email and we'll respond within 24 hours
            </p>
            <a
              href="mailto:support@docknow.app"
              className="text-ocean-600 hover:text-ocean-700 font-medium text-sm"
            >
              support@docknow.app →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <FaPhone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">
              Phone Support
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Call us Monday-Friday, 9am-5pm PST
            </p>
            <a
              href="tel:+18005551234"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              1-800-555-1234 →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <FaQuestionCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">
              Help Center
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Browse our documentation and FAQs
            </p>
            <a
              href="#"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Visit Help Center →
            </a>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-ocean-600 to-ocean-500 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-ocean-100">
                Our support team is available to assist you with any questions
                or issues
              </p>
            </div>
            <FaHeadset className="h-16 w-16 text-ocean-200" />
          </div>
        </div>
      </div>
    </>
  );
}
