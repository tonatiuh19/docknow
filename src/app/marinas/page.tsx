"use client";

import MetaHelmet from "@/components/MetaHelmet";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMarinas } from "@/store";
import { FaTimes, FaFilter, FaList, FaMap, FaAnchor } from "react-icons/fa";
import Header from "@/components/Header";
import MarinaCard from "@/components/marina/MarinaCard";
import MarinaFilterSidebar from "@/components/marina/MarinaFilterSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination";

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
    marinaPagination,
  } = useMarinas();

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMarinaId, setSelectedMarinaId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    setCurrentPage(1);
    fetchMarinas();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const offset = (page - 1) * itemsPerPage;
    fetchMarinas(offset, itemsPerPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setCurrentPage(1);
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50/20 to-slate-50">
      {/* Professional Header */}
      <Header />

      {/* Mobile Filter Toggle */}
      <div className="md:hidden fixed top-24 right-4 z-40">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative flex items-center gap-3 px-6 py-4 rounded-2xl text-white shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"></div>
          {showFilters ? (
            <>
              <FaTimes className="relative z-10 w-5 h-5" />{" "}
              <span className="relative z-10 font-bold">Close</span>
            </>
          ) : (
            <>
              <FaFilter className="relative z-10 w-5 h-5" />{" "}
              <span className="relative z-10 font-bold">Filters</span>
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
              <div className="mb-8 backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                      {marinas.length} Marina{marinas.length !== 1 ? "s" : ""}{" "}
                      Available
                    </h1>
                    <p className="text-slate-600">
                      {marinaFilters.search &&
                        `Searching for: ${marinaFilters.search}`}
                      {marinaFilters.city && ` in ${marinaFilters.city}`}
                      {marinaFilters.state && `, ${marinaFilters.state}`}
                    </p>
                  </div>

                  {/* View Toggle - Professional Style */}
                  <div className="flex backdrop-blur-xl bg-white/90 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`relative px-6 py-3 text-sm font-bold transition-all flex items-center gap-3 ${
                        viewMode === "list"
                          ? "text-white"
                          : "text-slate-700 hover:text-cyan-600"
                      }`}
                    >
                      {viewMode === "list" && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 shadow-lg"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                        </>
                      )}
                      <FaList className="relative z-10" />{" "}
                      <span className="relative z-10">List View</span>
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={`relative px-6 py-3 text-sm font-bold transition-all flex items-center gap-3 ${
                        viewMode === "map"
                          ? "text-white"
                          : "text-slate-700 hover:text-cyan-600"
                      }`}
                    >
                      {viewMode === "map" && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 shadow-lg"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                        </>
                      )}
                      <FaMap className="relative z-10" />{" "}
                      <span className="relative z-10">Map View</span>
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner
                  size="lg"
                  message="Finding the perfect marinas for you..."
                />
              ) : marinas.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-2xl p-16 text-center hover:shadow-cyan-500/10 transition-all duration-300">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"></div>
                    <div className="relative p-8 bg-gradient-to-br from-slate-100 to-cyan-50 rounded-full">
                      <FaAnchor className="inline text-slate-400 w-24 h-24" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3 mt-8">
                    No marinas found
                  </h3>
                  <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden group hover:scale-105 transition-all duration-300 shadow-xl shadow-cyan-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"></div>
                    <span className="relative z-10">Clear All Filters</span>
                  </button>
                </div>
              ) : viewMode === "map" ? (
                <div
                  className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden hover:shadow-cyan-500/10 transition-all duration-300"
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
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {marinas.map((marina) => (
                      <MarinaCard key={marina.id} marina={marina} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {marinaPagination &&
                    marinaPagination.total > itemsPerPage && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          marinaPagination.total / itemsPerPage
                        )}
                        totalItems={marinaPagination.total}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                      />
                    )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
