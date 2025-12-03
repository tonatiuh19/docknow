"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import axios from "axios";
import {
  FaShip,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Marina {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  total_slips: number;
  available_slips: number;
  total_bookings: number;
  total_revenue: number;
  is_active: boolean;
}

export default function MarinasPage() {
  const { hostToken } = useStore();
  const [marinas, setMarinas] = useState<Marina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarinas();
  }, []);

  const fetchMarinas = async () => {
    try {
      const response = await axios.get("/api/host/marinas", {
        headers: { Authorization: `Bearer ${hostToken}` },
      });
      setMarinas(response.data.marinas);
    } catch (error) {
      console.error("Failed to fetch marinas:", error);
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
        title="Marina Management | DockNow Host"
        description="Manage your marina and slip inventory"
        noindex={true}
        nofollow={true}
      />
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              Marina Management
            </h1>
            <p className="text-gray-600">
              Manage your marinas, slips, and amenities
            </p>
          </div>
          <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition">
            <FaPlus className="h-5 w-5" />
            <span>Add Marina</span>
          </button>
        </div>

        {/* Marinas Grid */}
        {marinas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaShip className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-900 mb-2">
              No Marinas Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first marina
            </p>
            <button className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition">
              <FaPlus className="h-5 w-5" />
              <span>Add Your First Marina</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {marinas.map((marina) => (
              <div
                key={marina.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy-900 mb-1">
                      {marina.name}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                      <span>
                        {marina.city}, {marina.state}, {marina.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-lg transition">
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Slips</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {marina.total_slips}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {marina.available_slips} available
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${marina.total_revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {marina.total_bookings} bookings
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <a
                    href={`/host/marina/${marina.id}/slips`}
                    className="flex-1 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 py-2 px-4 rounded-lg font-medium text-center transition"
                  >
                    Manage Slips
                  </a>
                  <a
                    href={`/host/marina/${marina.id}/details`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-center transition"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
