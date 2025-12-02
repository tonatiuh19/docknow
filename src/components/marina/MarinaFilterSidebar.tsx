import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaShip,
  FaStar,
  FaFilter,
  FaAnchor,
  FaWifi,
  FaParking,
  FaShower,
  FaUtensils,
  FaGasPump,
  FaWater,
  FaWarehouse,
  FaHome,
} from "react-icons/fa";
import {
  MdOutlineCleaningServices,
  MdSecurity,
  MdElectricBolt,
} from "react-icons/md";
import { useState } from "react";
import { AmenityType, BusinessType } from "@/store/slices/marinaSlice";
import DateAvailabilityCalendar from "./DateAvailabilityCalendar";

interface MarinaFilterSidebarProps {
  filters: {
    search: string;
    city: string | null;
    state: string | null;
    checkIn: string | null;
    checkOut: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minBoatLength: number | null;
    maxBoatLength: number | null;
    minDraft: number | null;
    featured: boolean | null;
    amenityIds: number[];
    businessTypeId: number | null;
  };
  filterOptions: {
    amenityTypes: AmenityType[];
    businessTypes: BusinessType[];
  } | null;
  onFilterChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const getAmenityIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("electric"))
    return <MdElectricBolt className="text-yellow-600" />;
  if (lowerName.includes("water")) return <FaWater className="text-blue-600" />;
  if (lowerName.includes("wifi")) return <FaWifi className="text-purple-600" />;
  if (lowerName.includes("fuel") || lowerName.includes("gas"))
    return <FaGasPump className="text-red-600" />;
  if (lowerName.includes("restroom") || lowerName.includes("toilet"))
    return <FaHome className="text-gray-600" />;
  if (lowerName.includes("shower"))
    return <FaShower className="text-blue-500" />;
  if (lowerName.includes("security"))
    return <MdSecurity className="text-green-600" />;
  if (lowerName.includes("restaurant") || lowerName.includes("food"))
    return <FaUtensils className="text-orange-600" />;
  if (lowerName.includes("laundry") || lowerName.includes("clean"))
    return <MdOutlineCleaningServices className="text-cyan-600" />;
  if (lowerName.includes("parking"))
    return <FaParking className="text-indigo-600" />;
  return <FaAnchor className="text-ocean-600" />;
};

export default function MarinaFilterSidebar({
  filters,
  filterOptions,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: MarinaFilterSidebarProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (checkIn: string, checkOut: string | null) => {
    onFilterChange({ checkIn, checkOut });
  };

  return (
    <div className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-2xl h-full flex flex-col overflow-hidden hover:shadow-cyan-500/10 transition-all duration-300">
      <div className="flex items-center justify-between p-6 border-b-2 border-slate-100 flex-shrink-0 bg-gradient-to-b from-white/90 to-transparent">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <FaFilter className="text-white w-5 h-5" />
          </div>
          Filters
        </h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-cyan-600 hover:text-cyan-700 font-bold transition-colors px-4 py-2 rounded-xl hover:bg-cyan-50"
        >
          Clear all
        </button>
      </div>

      {/* Scrollable filter content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Search/Location */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-ocean-600" />
            Search Marina
          </label>
          <input
            type="text"
            placeholder="Search by name or location..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
          />
        </div>

        {/* City Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-ocean-600" />
            City
          </label>
          <input
            type="text"
            placeholder="City..."
            value={filters.city || ""}
            onChange={(e) => onFilterChange({ city: e.target.value || null })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
          />
        </div>

        {/* State Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-ocean-600" />
            State
          </label>
          <input
            type="text"
            placeholder="State..."
            value={filters.state || ""}
            onChange={(e) => onFilterChange({ state: e.target.value || null })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Check-in / Check-out */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-ocean-600" />
            Availability Dates
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left hover:border-ocean-500 focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all bg-white"
          >
            {filters.checkIn && filters.checkOut ? (
              <span className="text-gray-900">
                {new Date(filters.checkIn).toLocaleDateString()} -{" "}
                {new Date(filters.checkOut).toLocaleDateString()}
              </span>
            ) : filters.checkIn ? (
              <span className="text-gray-900">
                Check-in: {new Date(filters.checkIn).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-gray-500">Select dates...</span>
            )}
          </button>

          {showCalendar && (
            <div className="mt-3 -mx-2">
              <DateAvailabilityCalendar
                bookedDates={[]}
                blockedDates={[]}
                availableSlips={[]}
                selectedCheckIn={filters.checkIn}
                selectedCheckOut={filters.checkOut}
                onDateSelect={handleDateSelect}
                minDate={new Date().toISOString().split("T")[0]}
                showLegend={false}
              />
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaDollarSign className="text-ocean-600" />
            Price Range (per day)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) =>
                onFilterChange({
                  minPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                onFilterChange({
                  maxPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Boat Length */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaShip className="text-ocean-600" />
            Boat Length (meters)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minBoatLength || ""}
              onChange={(e) =>
                onFilterChange({
                  minBoatLength: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxBoatLength || ""}
              onChange={(e) =>
                onFilterChange({
                  maxBoatLength: e.target.value
                    ? parseFloat(e.target.value)
                    : null,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Min Draft */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaShip className="text-ocean-600" />
            Minimum Draft (meters)
          </label>
          <input
            type="number"
            placeholder="Min draft..."
            value={filters.minDraft || ""}
            onChange={(e) =>
              onFilterChange({
                minDraft: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Featured Status */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaStar className="text-ocean-600" />
            Featured Marinas
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="radio"
                name="featured"
                checked={filters.featured === null}
                onChange={() => onFilterChange({ featured: null })}
                className="w-4 h-4 text-ocean-600 border-gray-300 focus:ring-ocean-500"
              />
              <span className="text-sm text-gray-700">All Marinas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="radio"
                name="featured"
                checked={filters.featured === true}
                onChange={() => onFilterChange({ featured: true })}
                className="w-4 h-4 text-ocean-600 border-gray-300 focus:ring-ocean-500"
              />
              <span className="text-sm text-gray-700">Featured Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="radio"
                name="featured"
                checked={filters.featured === false}
                onChange={() => onFilterChange({ featured: false })}
                className="w-4 h-4 text-ocean-600 border-gray-300 focus:ring-ocean-500"
              />
              <span className="text-sm text-gray-700">Not Featured</span>
            </label>
          </div>
        </div>

        {/* Business Type Filter */}
        {filterOptions?.businessTypes &&
          filterOptions.businessTypes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaWarehouse className="text-ocean-600" />
                Business Type
              </label>
              <select
                value={filters.businessTypeId || ""}
                onChange={(e) =>
                  onFilterChange({
                    businessTypeId: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">All Types</option>
                {filterOptions.businessTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          )}

        {/* Amenities Filter */}
        {filterOptions?.amenityTypes &&
          filterOptions.amenityTypes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaAnchor className="text-ocean-600" />
                Amenities
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {filterOptions.amenityTypes.map((amenity) => {
                  const isSelected = filters.amenityIds.includes(amenity.id);

                  return (
                    <label
                      key={amenity.id}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                        isSelected
                          ? "bg-ocean-50 border border-ocean-300"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newAmenityIds = e.target.checked
                            ? [...filters.amenityIds, amenity.id]
                            : filters.amenityIds.filter(
                                (id) => id !== amenity.id
                              );
                          onFilterChange({ amenityIds: newAmenityIds });
                        }}
                        className="w-4 h-4 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {getAmenityIcon(amenity.name)}
                        <span
                          className={`text-sm ${
                            isSelected
                              ? "font-semibold text-ocean-700"
                              : "text-gray-700"
                          }`}
                        >
                          {amenity.name}
                        </span>
                      </div>
                      {amenity.category && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {amenity.category}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Apply Filters Button - Fixed at bottom */}
      <div className="p-6 border-t border-gray-200/50 flex-shrink-0 bg-gradient-to-t from-white/50 to-transparent">
        <button
          onClick={onApplyFilters}
          className="relative w-full py-3 rounded-full font-semibold text-white overflow-hidden group shadow-lg hover:shadow-xl transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-ocean-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
          <span className="relative z-10">Apply Filters</span>
        </button>
      </div>
    </div>
  );
}
