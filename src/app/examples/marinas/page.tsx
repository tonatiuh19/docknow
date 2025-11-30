"use client";

import { useEffect } from "react";
import { useMarinas, useNotifications } from "@/store";

export default function MarinasExample() {
  const {
    marinas,
    marinasLoading,
    marinaFilters,
    marinaPagination,
    fetchMarinas,
    createMarina,
    updateMarina,
    deleteMarina,
    toggleMarinaStatus,
    setMarinaFilters,
    setMarinaPage,
  } = useMarinas();

  const { showSuccess, showError } = useNotifications();

  // Fetch marinas on mount and when filters/page change
  useEffect(() => {
    fetchMarinas();
  }, [marinaFilters, marinaPagination.page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarinaFilters({ search: e.target.value });
  };

  const handleFilterActive = (isActive: boolean | null) => {
    setMarinaFilters({ isActive });
  };

  const handleCreateMarina = async () => {
    try {
      await createMarina({
        name: "New Marina",
        slug: "new-marina",
        location: "San Diego, CA",
        is_active: true,
      });
      // Success notification shown automatically by the store
    } catch (error) {
      // Error notification shown automatically by the store
    }
  };

  const handleUpdateMarina = async (id: number) => {
    try {
      await updateMarina(id, {
        name: "Updated Marina Name",
      });
    } catch (error) {
      // Handled automatically
    }
  };

  const handleDeleteMarina = async (id: number) => {
    if (!confirm("Are you sure you want to delete this marina?")) return;

    try {
      await deleteMarina(id);
    } catch (error) {
      // Handled automatically
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleMarinaStatus(id);
    } catch (error) {
      // Handled automatically
    }
  };

  if (marinasLoading === "loading" && marinas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Marinas Management</h1>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search marinas..."
            value={marinaFilters.search}
            onChange={handleSearch}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={marinaFilters.isActive?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterActive(value === "" ? null : value === "true");
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            onClick={handleCreateMarina}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Marina
          </button>
        </div>
      </div>

      {/* Marinas List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {marinas.map((marina) => (
          <div
            key={marina.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{marina.name}</h3>
                <p className="text-gray-600 text-sm">{marina.location}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  marina.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {marina.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {marina.description && (
              <p className="text-gray-700 mb-4 line-clamp-2">
                {marina.description}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateMarina(marina.id)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleStatus(marina.id)}
                className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                Toggle
              </button>
              <button
                onClick={() => handleDeleteMarina(marina.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {marinas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No marinas found</p>
        </div>
      )}

      {/* Pagination */}
      {marinaPagination.total > marinaPagination.limit && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setMarinaPage(marinaPagination.page - 1)}
            disabled={marinaPagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2 border border-gray-300 rounded bg-gray-50">
            Page {marinaPagination.page} of{" "}
            {Math.ceil(marinaPagination.total / marinaPagination.limit)}
          </span>

          <button
            onClick={() => setMarinaPage(marinaPagination.page + 1)}
            disabled={
              marinaPagination.page >=
              Math.ceil(marinaPagination.total / marinaPagination.limit)
            }
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {marinasLoading === "loading" && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
