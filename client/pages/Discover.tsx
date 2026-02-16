import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Filter,
  Star,
  Wifi,
  Car,
  Zap,
  Fuel,
  Anchor,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Ship,
  Waves,
  Ruler,
  Navigation as NavigationIcon,
  Loader2,
  Mountain,
  Compass,
  MapIcon as MapPinIcon,
  Settings,
  Shield,
  Building,
  TreePine,
} from "lucide-react";
import { LayoutGrid, Map as MapIcon, List as ListIcon } from "lucide-react";
import MarinaMap from "@/components/MarinaMap";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMarinas,
  fetchMarinaFilters,
  searchMarinas,
  loadMoreMarinas,
  updateSearchParams,
  clearSearchResults,
  setViewType,
  setSelectedMarina,
} from "@/store/slices/discoverySlice";
import {
  selectDiscoveryViewData,
  selectFilterOptionsData,
  selectSearchBarData,
  selectCanLoadMore,
  selectHasActiveFilters,
  selectPagination,
  selectSearchParams,
} from "@/store/selectors/discoverySelectors";

const Discover = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const { marinas, viewType, loading } = useAppSelector(
    selectDiscoveryViewData,
  );
  const { filters, loading: filtersLoading } = useAppSelector(
    selectFilterOptionsData,
  );
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);
  const canLoadMore = useAppSelector(selectCanLoadMore);
  const pagination = useAppSelector(selectPagination);
  const searchParams = useAppSelector(selectSearchParams);

  // Local form state
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localSelectedLocation, setLocalSelectedLocation] = useState("all");
  const [localCheckIn, setLocalCheckIn] = useState("");
  const [localCheckOut, setLocalCheckOut] = useState("");
  const [localPriceRange, setLocalPriceRange] = useState([0, 1000]);
  const [localBoatLength, setLocalBoatLength] = useState([0]);
  const [localDraft, setLocalDraft] = useState([0]);
  const [localSelectedAmenities, setLocalSelectedAmenities] = useState<
    string[]
  >([]);
  const [localBusinessType, setLocalBusinessType] = useState("all");
  // New filter state variables
  const [localSelectedSeabedTypes, setLocalSelectedSeabedTypes] = useState<
    number[]
  >([]);
  const [localSelectedMooringTypes, setLocalSelectedMooringTypes] = useState<
    number[]
  >([]);
  const [localSelectedPointTypes, setLocalSelectedPointTypes] = useState<
    number[]
  >([]);
  const [localSelectedAnchorageTypes, setLocalSelectedAnchorageTypes] =
    useState<number[]>([]);
  const [localProtectionLevel, setLocalProtectionLevel] = useState("all");
  const [localSelectedMarinaFeatures, setLocalSelectedMarinaFeatures] =
    useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    dispatch(fetchMarinaFilters());
    dispatch(fetchMarinas({}));
  }, [dispatch]);

  // Sync local form with Redux store
  useEffect(() => {
    setLocalSearchQuery(searchParams.searchTerm || "");
    setLocalSelectedLocation(searchParams.city || "all");
    setLocalCheckIn(searchParams.checkIn || "");
    setLocalCheckOut(searchParams.checkOut || "");
    setLocalPriceRange([
      searchParams.minPrice || 0,
      searchParams.maxPrice || 1000,
    ]);
    setLocalBoatLength([searchParams.minBoatLength || 0]);
    setLocalDraft([searchParams.minDraft || 0]);
    setLocalSelectedAmenities(searchParams.amenities || []);
    setLocalBusinessType(searchParams.businessTypeId?.toString() || "all");
    // Sync new filter states
    setLocalSelectedSeabedTypes(searchParams.seabedTypes || []);
    setLocalSelectedMooringTypes(searchParams.mooringTypes || []);
    setLocalSelectedPointTypes(searchParams.pointTypes || []);
    setLocalSelectedAnchorageTypes(searchParams.anchorageTypes || []);
    setLocalProtectionLevel(searchParams.protectionLevel || "all");
    setLocalSelectedMarinaFeatures(searchParams.marinaFeatures || []);
  }, [searchParams]);

  // Handle search
  const handleSearch = () => {
    const searchData = {
      searchTerm: localSearchQuery || undefined,
      city: localSelectedLocation || undefined,
      checkIn: localCheckIn || undefined,
      checkOut: localCheckOut || undefined,
      minPrice: localPriceRange[0] > 0 ? localPriceRange[0] : undefined,
      maxPrice: localPriceRange[1] < 1000 ? localPriceRange[1] : undefined,
      minBoatLength: localBoatLength[0] > 0 ? localBoatLength[0] : undefined,
      minDraft: localDraft[0] > 0 ? localDraft[0] : undefined,
      amenities:
        localSelectedAmenities.length > 0 ? localSelectedAmenities : undefined,
      businessTypeId: localBusinessType
        ? parseInt(localBusinessType)
        : undefined,
      // New filter parameters
      seabedTypes:
        localSelectedSeabedTypes.length > 0
          ? localSelectedSeabedTypes
          : undefined,
      mooringTypes:
        localSelectedMooringTypes.length > 0
          ? localSelectedMooringTypes
          : undefined,
      pointTypes:
        localSelectedPointTypes.length > 0
          ? localSelectedPointTypes
          : undefined,
      anchorageTypes:
        localSelectedAnchorageTypes.length > 0
          ? localSelectedAnchorageTypes
          : undefined,
      protectionLevel:
        localProtectionLevel && localProtectionLevel !== "all"
          ? localProtectionLevel
          : undefined,
      marinaFeatures:
        localSelectedMarinaFeatures.length > 0
          ? localSelectedMarinaFeatures
          : undefined,
      limit: 20,
      offset: 0,
    };

    dispatch(updateSearchParams(searchData));
    dispatch(searchMarinas(searchData));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setLocalSearchQuery("");
    setLocalSelectedLocation("all");
    setLocalCheckIn("");
    setLocalCheckOut("");
    setLocalPriceRange([0, 1000]);
    setLocalBoatLength([0]);
    setLocalDraft([0]);
    setLocalSelectedAmenities([]);
    setLocalBusinessType("all");
    // Clear new filter states
    setLocalSelectedSeabedTypes([]);
    setLocalSelectedMooringTypes([]);
    setLocalSelectedPointTypes([]);
    setLocalSelectedAnchorageTypes([]);
    setLocalProtectionLevel("all");
    setLocalSelectedMarinaFeatures([]);

    dispatch(clearSearchResults());
    dispatch(fetchMarinas({}));
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenitySlug: string) => {
    setLocalSelectedAmenities((prev) =>
      prev.includes(amenitySlug)
        ? prev.filter((a) => a !== amenitySlug)
        : [...prev, amenitySlug],
    );
  };

  // Handle new filter selections
  const handleSeabedTypeToggle = (seabedTypeId: number) => {
    setLocalSelectedSeabedTypes((prev) =>
      prev.includes(seabedTypeId)
        ? prev.filter((id) => id !== seabedTypeId)
        : [...prev, seabedTypeId],
    );
  };

  const handleMooringTypeToggle = (mooringTypeId: number) => {
    setLocalSelectedMooringTypes((prev) =>
      prev.includes(mooringTypeId)
        ? prev.filter((id) => id !== mooringTypeId)
        : [...prev, mooringTypeId],
    );
  };

  const handlePointTypeToggle = (pointTypeId: number) => {
    setLocalSelectedPointTypes((prev) =>
      prev.includes(pointTypeId)
        ? prev.filter((id) => id !== pointTypeId)
        : [...prev, pointTypeId],
    );
  };

  const handleAnchorageTypeToggle = (anchorageTypeId: number) => {
    setLocalSelectedAnchorageTypes((prev) =>
      prev.includes(anchorageTypeId)
        ? prev.filter((id) => id !== anchorageTypeId)
        : [...prev, anchorageTypeId],
    );
  };

  const handleMarinaFeatureToggle = (featureKey: string) => {
    setLocalSelectedMarinaFeatures((prev) =>
      prev.includes(featureKey)
        ? prev.filter((key) => key !== featureKey)
        : [...prev, featureKey],
    );
  };

  // Handle load more
  const handleLoadMore = () => {
    dispatch(loadMoreMarinas());
  };

  // Handle view type change
  const handleViewTypeChange = (type: "list" | "map") => {
    dispatch(setViewType(type));
  };

  const getAvailabilityStatus = (marina: any) => {
    const occupancyRate = marina.available_slips / marina.total_slips;
    if (occupancyRate > 0.7)
      return {
        text: "Available",
        class: "bg-green-100 text-green-800 border-green-200",
      };
    if (occupancyRate > 0.3)
      return {
        text: "Limited",
        class: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return { text: "Full", class: "bg-red-100 text-red-800 border-red-200" };
  };

  const getAmenityIcons = (amenitiesString: string) => {
    if (!amenitiesString) return [];
    const amenityNames = amenitiesString
      .split(",")
      .map((a) => a.trim().toLowerCase());

    const iconMap: Record<string, React.ComponentType<any>> = {
      wifi: Wifi,
      parking: Car,
      electricity: Zap,
      fuel: Fuel,
      water: Waves,
      security: Anchor,
    };

    return amenityNames
      .map((name) => iconMap[name])
      .filter(Boolean)
      .slice(0, 3);
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <Layout>
      <MetaHelmet
        title="Discover Marinas - DockNow"
        description="Explore and discover marinas worldwide. Find the perfect marina slip for your boat with advanced filters, real-time availability, and instant booking."
        keywords="discover marinas, find marina, boat slip search, marina directory, yacht berth finder, harbor listings, marina locations"
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
      />
      <div className="min-h-screen bg-navy-50/50">
        {/* Header */}
        <div className="relative bg-navy-950 pt-32 pb-20 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-ocean-500 rounded-full blur-[120px]"
          />
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white text-center"
            >
              Discover Marinas Worldwide
            </motion.h1>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-80 shrink-0 space-y-6"
            >
              <Card className="shadow-2xl border-none ring-1 ring-navy-200/50 overflow-hidden">
                <CardHeader className="bg-navy-900 text-white py-6">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Filter className="w-5 h-5 text-ocean-400" />
                    Filters
                    {filtersLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {/* Location Search */}
                  <div className="space-y-3">
                    <Label className="text-navy-900 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-ocean-600" />
                      Location
                    </Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Marina or City name"
                        className="h-11 rounded-xl border-navy-100 bg-navy-50/50"
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                      />
                      <Select
                        value={localSelectedLocation}
                        onValueChange={setLocalSelectedLocation}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-navy-100 bg-navy-50/50">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {filters?.locations.map((location) => (
                            <SelectItem
                              key={location.label}
                              value={location.city}
                            >
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-3">
                    <Label className="text-navy-900 font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-ocean-600" />
                      Check-in / Check-out
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        className="h-11 rounded-xl border-navy-100 bg-navy-50/50 text-xs"
                        value={localCheckIn}
                        onChange={(e) => setLocalCheckIn(e.target.value)}
                      />
                      <Input
                        type="date"
                        className="h-11 rounded-xl border-navy-100 bg-navy-50/50 text-xs"
                        value={localCheckOut}
                        onChange={(e) => setLocalCheckOut(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator className="bg-navy-100" />

                  {/* Price Range */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-navy-900 font-bold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-ocean-600" />
                        Price / Day
                      </Label>
                      <span className="text-xs font-bold text-ocean-600">
                        ${localPriceRange[0]} - $
                        {localPriceRange[1] === 1000
                          ? "1000+"
                          : localPriceRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={localPriceRange}
                      max={1000}
                      step={10}
                      onValueChange={setLocalPriceRange}
                      className="py-4"
                    />
                  </div>

                  {/* Boat Specifications */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-navy-900 font-bold flex items-center gap-2">
                          <Ship className="w-4 h-4 text-ocean-600" />
                          Min Boat Length
                        </Label>
                        <span className="text-xs font-bold text-ocean-600">
                          {localBoatLength[0] === 0
                            ? "Any"
                            : `${localBoatLength[0]}m`}
                        </span>
                      </div>
                      <Slider
                        value={localBoatLength}
                        max={100}
                        step={1}
                        onValueChange={setLocalBoatLength}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-navy-900 font-bold flex items-center gap-2">
                          <Waves className="w-4 h-4 text-ocean-600" />
                          Min Draft
                        </Label>
                        <span className="text-xs font-bold text-ocean-600">
                          {localDraft[0] === 0 ? "Any" : `${localDraft[0]}m`}
                        </span>
                      </div>
                      <Slider
                        value={localDraft}
                        max={20}
                        step={0.5}
                        onValueChange={setLocalDraft}
                      />
                    </div>
                  </div>

                  <Separator className="bg-navy-100" />

                  {/* Business Type */}
                  {filters?.businessTypes &&
                    filters.businessTypes.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-navy-900 font-bold flex items-center gap-2">
                          <Anchor className="w-4 h-4 text-ocean-600" />
                          Marina Type
                        </Label>
                        <Select
                          value={localBusinessType}
                          onValueChange={setLocalBusinessType}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-navy-100 bg-navy-50/50">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {filters.businessTypes.map((type) => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* Amenities */}
                  {filters?.amenityTypes && filters.amenityTypes.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-navy-900 font-bold flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-ocean-600" />
                        Amenities
                      </Label>
                      <div className="grid gap-3">
                        {filters.amenityTypes.slice(0, 6).map((amenity) => (
                          <div
                            key={amenity.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={amenity.slug}
                              className="rounded border-navy-200 text-ocean-600 focus:ring-ocean-500"
                              checked={localSelectedAmenities.includes(
                                amenity.slug,
                              )}
                              onCheckedChange={() =>
                                handleAmenityToggle(amenity.slug)
                              }
                            />
                            <label
                              htmlFor={amenity.slug}
                              className="text-sm font-medium leading-none text-navy-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {amenity.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="bg-navy-100" />

                  {/* Marina Features */}
                  {filters?.marinaFeatures &&
                    filters.marinaFeatures.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-navy-900 font-bold flex items-center gap-2 mb-4">
                          <Settings className="w-4 h-4 text-ocean-600" />
                          Marina Features
                        </Label>
                        <div className="grid gap-3">
                          {filters.marinaFeatures.slice(0, 6).map((feature) => (
                            <div
                              key={feature.key}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={feature.key}
                                className="rounded border-navy-200 text-ocean-600 focus:ring-ocean-500"
                                checked={localSelectedMarinaFeatures.includes(
                                  feature.key,
                                )}
                                onCheckedChange={() =>
                                  handleMarinaFeatureToggle(feature.key)
                                }
                              />
                              <label
                                htmlFor={feature.key}
                                className="text-sm font-medium leading-none text-navy-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {feature.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <Separator className="bg-navy-100" />

                  {/* Anchorage Protection Level */}
                  {filters?.protectionLevels &&
                    filters.protectionLevels.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-navy-900 font-bold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-ocean-600" />
                          Protection Level
                        </Label>
                        <Select
                          value={localProtectionLevel}
                          onValueChange={setLocalProtectionLevel}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-navy-100 bg-navy-50/50">
                            <SelectValue placeholder="All Levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {filters.protectionLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* Seabed Types */}
                  {filters?.seabedTypes && filters.seabedTypes.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-navy-900 font-bold flex items-center gap-2 mb-4">
                        <Mountain className="w-4 h-4 text-ocean-600" />
                        Seabed Types
                      </Label>
                      <div className="grid gap-3">
                        {filters.seabedTypes.slice(0, 5).map((seabedType) => (
                          <div
                            key={seabedType.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`seabed-${seabedType.id}`}
                              className="rounded border-navy-200 text-ocean-600 focus:ring-ocean-500"
                              checked={localSelectedSeabedTypes.includes(
                                seabedType.id,
                              )}
                              onCheckedChange={() =>
                                handleSeabedTypeToggle(seabedType.id)
                              }
                            />
                            <label
                              htmlFor={`seabed-${seabedType.id}`}
                              className="text-sm font-medium leading-none text-navy-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {seabedType.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mooring Types */}
                  {filters?.mooringTypes && filters.mooringTypes.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-navy-900 font-bold flex items-center gap-2 mb-4">
                        <Anchor className="w-4 h-4 text-ocean-600" />
                        Mooring Types
                      </Label>
                      <div className="grid gap-3">
                        {filters.mooringTypes.slice(0, 5).map((mooringType) => (
                          <div
                            key={mooringType.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mooring-${mooringType.id}`}
                              className="rounded border-navy-200 text-ocean-600 focus:ring-ocean-500"
                              checked={localSelectedMooringTypes.includes(
                                mooringType.id,
                              )}
                              onCheckedChange={() =>
                                handleMooringTypeToggle(mooringType.id)
                              }
                            />
                            <label
                              htmlFor={`mooring-${mooringType.id}`}
                              className="text-sm font-medium leading-none text-navy-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {mooringType.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anchorage Types */}
                  {filters?.anchorageTypes &&
                    filters.anchorageTypes.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-navy-900 font-bold flex items-center gap-2 mb-4">
                          <Compass className="w-4 h-4 text-ocean-600" />
                          Anchorage Types
                        </Label>
                        <div className="grid gap-3">
                          {filters.anchorageTypes
                            .slice(0, 4)
                            .map((anchorageType) => (
                              <div
                                key={anchorageType.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`anchorage-${anchorageType.id}`}
                                  className="rounded border-navy-200 text-ocean-600 focus:ring-ocean-500"
                                  checked={localSelectedAnchorageTypes.includes(
                                    anchorageType.id,
                                  )}
                                  onCheckedChange={() =>
                                    handleAnchorageTypeToggle(anchorageType.id)
                                  }
                                />
                                <label
                                  htmlFor={`anchorage-${anchorageType.id}`}
                                  className="text-sm font-medium leading-none text-navy-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {anchorageType.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Points of Interest */}
                  {filters?.pointTypes && filters.pointTypes.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-navy-900 font-bold flex items-center gap-2 mb-4">
                        <MapPinIcon className="w-4 h-4 text-ocean-600" />
                        Points of Interest
                      </Label>
                      <div className="grid gap-3">
                        {filters.pointTypes.slice(0, 6).map((pointType) => (
                          <div
                            key={pointType.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`point-${pointType.id}`}
                              className="rounded border-navy-200 text-ocean-600 focus:ring-ocean-500"
                              checked={localSelectedPointTypes.includes(
                                pointType.id,
                              )}
                              onCheckedChange={() =>
                                handlePointTypeToggle(pointType.id)
                              }
                            />
                            <label
                              htmlFor={`point-${pointType.id}`}
                              className="text-sm font-medium leading-none text-navy-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {pointType.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-ocean hover:shadow-glow text-white h-12 font-bold rounded-xl mt-4"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      "Apply Filters"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-navy-400 hover:text-navy-900 hover:bg-navy-50 font-bold text-xs uppercase tracking-widest"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Clear All
                  </Button>
                </CardContent>
              </Card>

              {/* Recently Viewed */}
              <Card className="shadow-xl border-none ring-1 ring-navy-200/50 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ocean-600" />
                  Recently Viewed
                </h3>
                <div className="space-y-4">
                  {[
                    { name: "Marina Vallarta", loc: "Mexico" },
                    { name: "Marina Cabo", loc: "Mexico" },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0 group-hover:bg-ocean-50 transition-colors">
                        <Anchor className="w-5 h-5 text-navy-400 group-hover:text-ocean-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-900 group-hover:text-ocean-600 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-navy-400">{p.loc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tips Section */}
              <Card className="shadow-xl border-none bg-gradient-ocean p-6 text-white relative overflow-hidden group">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                />
                <div className="relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Pro Tip
                  </h3>
                  <p className="text-xs leading-relaxed text-white/80">
                    Booking more than 7 days? Ask about our "Golden Anchor"
                    long-stay discounts in most Mexican ports.
                  </p>
                </div>
              </Card>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-navy-50">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-navy-900">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      `${pagination.total} results`
                    )}
                  </h2>
                  <Separator
                    orientation="vertical"
                    className="h-6 hidden sm:block"
                  />
                  <div className="flex bg-navy-50 p-1 rounded-xl">
                    <Button
                      variant={viewType === "list" ? "default" : "ghost"}
                      size="sm"
                      className={`rounded-lg px-4 font-bold transition-all ${viewType === "list" ? "shadow-sm text-white" : "text-navy-400"}`}
                      onClick={() => handleViewTypeChange("list")}
                    >
                      <ListIcon className="w-4 h-4 mr-2" />
                      List
                    </Button>
                    <Button
                      variant={viewType === "map" ? "default" : "ghost"}
                      size="sm"
                      className={`rounded-lg px-4 font-bold transition-all ${viewType === "map" ? "shadow-sm text-white" : "text-navy-400"}`}
                      onClick={() => handleViewTypeChange("map")}
                    >
                      <MapIcon className="w-4 h-4 mr-2" />
                      Map
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-bold text-navy-400 whitespace-nowrap">
                    Sort by:
                  </span>
                  <Select defaultValue="rating">
                    <SelectTrigger className="w-full sm:w-40 border-none bg-navy-50/50 hover:bg-navy-50 font-bold text-navy-900 rounded-xl px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low</SelectItem>
                      <SelectItem value="price-high">Price: High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {viewType === "map" ? (
                  <motion.div
                    key="map-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full"
                  >
                    <Card className="h-[750px] shadow-2xl border-none overflow-hidden group ring-1 ring-navy-200/50">
                      <CardHeader className="bg-white border-b border-navy-50 px-8 py-6">
                        <CardTitle className="flex items-center justify-between text-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-ocean-50 rounded-xl flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-ocean-600" />
                            </div>
                            Marina Locations Map
                          </div>
                          <div className="text-sm font-normal text-navy-500">
                            {marinas.length} marina
                            {marinas.length !== 1 ? "s" : ""} shown
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-full p-0">
                        <div className="h-full">
                          <MarinaMap marinas={marinas} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-view"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {marinas.map((marina) => {
                      const availability = getAvailabilityStatus(marina);
                      const amenityIcons = getAmenityIcons(marina.amenities);

                      return (
                        <motion.div key={marina.id} variants={itemVariants}>
                          <Link
                            to={`/discover/${marina.slug}`}
                            className="block"
                          >
                            <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-none shadow-lg group overflow-hidden bg-white ring-1 ring-navy-100/50 h-full flex flex-col">
                              <CardContent className="p-0 flex-1 flex flex-col">
                                <div className="h-48 relative overflow-hidden">
                                  {marina.primary_image_url ? (
                                    <>
                                      <img
                                        src={marina.primary_image_url}
                                        alt={marina.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                      {marina.total_images &&
                                        marina.total_images > 1 && (
                                          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            +{marina.total_images - 1} more
                                          </div>
                                        )}
                                    </>
                                  ) : (
                                    <div className="h-full bg-gradient-ocean flex items-center justify-center relative overflow-hidden">
                                      <Anchor className="w-12 h-12 text-white/80 group-hover:rotate-12 transition-transform duration-500 relative z-10" />
                                      <motion.div
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          rotate: [0, 90, 0],
                                        }}
                                        transition={{
                                          duration: 15,
                                          repeat: Infinity,
                                        }}
                                        className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 p-6 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-bold text-xl text-navy-900 group-hover:text-ocean-600 transition-colors">
                                        {marina.name}
                                      </h3>
                                      <p className="text-navy-500 flex items-center gap-1.5 text-sm">
                                        <MapPin className="w-3.5 h-3.5 text-ocean-500" />
                                        {marina.city},{" "}
                                        {marina.state || marina.country}
                                      </p>
                                    </div>
                                    <Badge
                                      className={`${availability.class} border shadow-sm rounded-full px-3 font-bold`}
                                    >
                                      {availability.text}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-4 py-2 border-y border-navy-50">
                                    <div className="flex items-center gap-1.5">
                                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                      <span className="font-bold text-navy-900">
                                        {marina.avg_rating
                                          ? marina.avg_rating.toFixed(1)
                                          : "4.5"}
                                      </span>
                                    </div>
                                    <Separator
                                      orientation="vertical"
                                      className="h-4 bg-navy-100"
                                    />
                                    <div className="flex items-center gap-1.5 text-sm text-navy-500">
                                      <Users className="w-4 h-4 text-ocean-500" />
                                      <span>
                                        {marina.total_slips -
                                          marina.available_slips}
                                        /{marina.total_slips}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                      {amenityIcons
                                        .slice(0, 3)
                                        .map((Icon, index) => (
                                          <div
                                            key={index}
                                            className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center hover:bg-ocean-50 hover:text-ocean-600 transition-colors"
                                          >
                                            <Icon className="w-4 h-4" />
                                          </div>
                                        ))}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-2xl font-black text-navy-900">
                                        ${marina.price_per_day}
                                        <span className="text-xs font-medium text-navy-400 ml-1">
                                          /day
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {viewType === "list" && canLoadMore && (
                <Button
                  variant="ghost"
                  className="w-full h-14 rounded-2xl hover:bg-white text-navy-500 hover:text-ocean-600 font-bold transition-all border-dashed border-2 border-navy-100 mt-8"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading More...
                    </>
                  ) : (
                    "Load More Marinas"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
