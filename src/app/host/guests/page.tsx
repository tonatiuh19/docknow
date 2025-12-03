"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import axios from "axios";
import { FaUsers, FaEnvelope, FaPhone } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function GuestsPage() {
  const { hostToken } = useStore();
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await axios.get("/api/host/guests", {
        headers: { Authorization: `Bearer ${hostToken}` },
      });
      setGuests(response.data.guests);
    } catch (error) {
      console.error("Failed to fetch guests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <MetaHelmet
        title="Guest Management | DockNow Host"
        description="View and manage your marina guests"
        noindex={true}
        nofollow={true}
      />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Guests</h1>
          <p className="text-gray-600">
            View and manage guests who have booked at your marinas
          </p>
        </div>

        {/* Guests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FaUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy-900 mb-2">
                No Guests Yet
              </h3>
              <p className="text-gray-600">
                Guests will appear here once they book at your marinas
              </p>
            </div>
          ) : (
            guests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center mr-4">
                    <FaUsers className="h-6 w-6 text-ocean-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-navy-900">
                      {guest.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {guest.country_code}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="h-4 w-4 mr-2" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                  {guest.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaPhone className="h-4 w-4 mr-2" />
                      <span>
                        {guest.phone_code} {guest.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bookings</p>
                      <p className="text-lg font-bold text-navy-900">
                        {guest.total_bookings}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                      <p className="text-lg font-bold text-green-600">
                        ${guest.total_spent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
