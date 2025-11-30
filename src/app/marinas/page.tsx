"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMarinas } from "@/store";
import { FaTimes, FaFilter, FaList, FaMap, FaAnchor } from "react-icons/fa";
import Header from "@/components/Header";
import MarinaCard from "@/components/marina/MarinaCard";
import MarinaFilterSidebar from "@/components/marina/MarinaFilterSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const MarinaMap = dynamic(() => import("@/components/MarinaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <LoadingSpinner message="Loading map..." />
    </div>
  ),
});

export default function MarinasPage() {
  const searchParams = useSearchParams();

  // Use marina selector hook
  const {
    marinas,
    marinasLoading,
    fetchMarinas,
    fetchFilterOptions,
    marinaFilters,
    setMarinaFilters,
    filterOptions,
    filterOptionsLoading,
  } = useMarinas();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMarinaId, setSelectedMarinaId] = useState<number | null>(null);

  // Fetch marinas on mount only
  useEffect(() => {
    fetchMarinas();
    fetchFilterOptions(); // Load filter options (amenities, business types, etc.)
  }, []); // Empty deps - fetch only once on mount

  // Initialize filters from URL params
  useEffect(() => {
    const location = searchParams?.get("location");
    if (location) {
      setMarinaFilters({ search: location });
      fetchMarinas(); // Manually trigger fetch after setting filter
    }
  }, [searchParams]);

  const loading = marinasLoading === "loading";

  const handleApplyFilters = () => {
    fetchMarinas();
  };

  const clearFilters = () => {
    setMarinaFilters({
      search: "",
      city: null,
      state: null,
      checkIn: null,
      checkOut: null,
      minPrice: null,
      maxPrice: null,
      minBoatLength: null,
      maxBoatLength: null,
      minDraft: null,
      featured: null,
      amenityIds: [],
      businessTypeId: null,
    });
    fetchMarinas();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Glassmorphic Header */}
      <Header />

      {/* Mobile Filter Toggle */}
      <div className="md:hidden fixed top-24 right-4 z-40">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative flex items-center gap-2 px-5 py-3 rounded-full text-white shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>
          {showFilters ? (
            <>
              <FaTimes className="relative z-10" />{" "}
              <span className="relative z-10">Close</span>
            </>
          ) : (
            <>
              <FaFilter className="relative z-10" />{" "}
              <span className="relative z-10">Filters</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden pt-20">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex flex-col md:flex-row gap-8 h-full py-8">
            {/* Enhanced Filters Sidebar - Fixed with internal scroll */}
            <aside
              className={`w-full md:w-80 flex-shrink-0 ${
                showFilters ? "block" : "hidden md:block"
              }`}
            >
              <MarinaFilterSidebar
                filters={marinaFilters}
                filterOptions={filterOptions}
                onFilterChange={setMarinaFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={clearFilters}
              />
            </aside>

            {/* Results - Scrollable content */}
            <main className="flex-1 overflow-y-auto">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {marinas.length} Marina{marinas.length !== 1 ? "s" : ""}{" "}
                    Available
                  </h1>
                  <p className="text-gray-600">
                    {marinaFilters.search &&
                      `Searching for: ${marinaFilters.search}`}
                    {marinaFilters.city && ` in ${marinaFilters.city}`}
                    {marinaFilters.state && `, ${marinaFilters.state}`}
                  </p>
                </div>

                {/* View Toggle - Glass Style */}
                <div className="flex backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`relative px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                      viewMode === "list"
                        ? "text-white"
                        : "text-gray-700 hover:text-ocean-600"
                    }`}
                  >
                    {viewMode === "list" && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600 shadow-inner"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                      </>
                    )}
                    <FaList className="relative z-10" />{" "}
                    <span className="relative z-10">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`relative px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                      viewMode === "map"
                        ? "text-white"
                        : "text-gray-700 hover:text-ocean-600"
                    }`}
                  >
                    {viewMode === "map" && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600 shadow-inner"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                      </>
                    )}
                    <FaMap className="relative z-10" />{" "}
                    <span className="relative z-10">Map</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner
                  size="lg"
                  message="Finding the perfect marinas for you..."
                />
              ) : marinas.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-xl p-12 text-center">
                  <div className="text-6xl mb-4">
                    <FaAnchor className="inline text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No marinas found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="relative px-6 py-3 rounded-full font-semibold text-white overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                    <span className="relative z-10">Clear Filters</span>
                  </button>
                </div>
              ) : viewMode === "map" ? (
                <div
                  className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-xl overflow-hidden"
                  style={{ height: "600px" }}
                >
                  <MarinaMap
                    marinas={marinas}
                    selectedMarinaId={selectedMarinaId ?? undefined}
                    onMarkerClick={(marina) => setSelectedMarinaId(marina.id)}
                    height="600px"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {marinas.map((marina) => (
                    <MarinaCard key={marina.id} marina={marina} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
