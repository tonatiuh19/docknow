"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FiAnchor,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMaximize2,
} from "react-icons/fi";

interface BoatSelectionStepProps {
  onNext: () => void;
}

export default function BoatSelectionStep({ onNext }: BoatSelectionStepProps) {
  const [showAddBoat, setShowAddBoat] = useState(false);
  const [editingBoat, setEditingBoat] = useState<any>(null);
  const [availableSlips, setAvailableSlips] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    manufacturer: "",
    boatTypeId: "",
    year: "",
    lengthMeters: "",
    widthMeters: "",
    draftMeters: "",
    homeMarina: "",
    registrationNumber: "",
    insurancePolicyNumber: "",
  });

  const user = useStore((state) => state.user);
  const marinaData = useStore((state) => state.marinaData);
  const checkIn = useStore((state) => state.checkIn);
  const checkOut = useStore((state) => state.checkOut);
  const boats = useStore((state) => state.boats);
  const boatsLoading = useStore((state) => state.boatsLoading);
  const selectedBoat = useStore((state) => state.selectedBoat);
  const boatTypes = useStore((state) => state.boatTypes);
  const fetchBoats = useStore((state) => state.fetchBoats);
  const fetchBoatTypes = useStore((state) => state.fetchBoatTypes);
  const createBoat = useStore((state) => state.createBoat);
  const updateBoat = useStore((state) => state.updateBoat);
  const deleteBoat = useStore((state) => state.deleteBoat);
  const setSelectedBoat = useStore((state) => state.setSelectedBoat);
  const setSelectedSlipId = useStore((state) => state.setSelectedSlipId);

  useEffect(() => {
    if (user?.id) {
      fetchBoats(user.id);
      fetchBoatTypes();
    }
  }, [user?.id]);

  // Check slip availability when boat is selected
  useEffect(() => {
    if (selectedBoat && marinaData && checkIn && checkOut) {
      checkSlipAvailability();
    }
  }, [selectedBoat, marinaData?.id, checkIn, checkOut]);

  const checkSlipAvailability = async () => {
    if (!selectedBoat || !marinaData || !checkIn || !checkOut) return;

    setCheckingAvailability(true);
    setSlipError(null);

    try {
      const params = new URLSearchParams({
        marinaId: marinaData.id.toString(),
        checkIn,
        checkOut,
        boatLength: selectedBoat.length_meters.toString(),
        ...(selectedBoat.width_meters && {
          boatWidth: selectedBoat.width_meters.toString(),
        }),
        ...(selectedBoat.draft_meters && {
          boatDraft: selectedBoat.draft_meters.toString(),
        }),
      });

      const response = await fetch(`/api/slips/available?${params}`);
      const data = await response.json();

      if (data.success) {
        setAvailableSlips(data.data.slips);
        if (data.data.availableCount === 0) {
          setSlipError(
            "No slips available for your boat size during these dates"
          );
          setSelectedSlipId(null);
        } else {
          // Auto-select the first available slip (best price)
          setSelectedSlipId(data.data.slips[0].id);
        }
      } else {
        setSlipError(data.error || "Failed to check slip availability");
        setSelectedSlipId(null);
      }
    } catch (error) {
      console.error("Error checking slip availability:", error);
      setSlipError("Failed to check slip availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmitBoat = async (e: React.FormEvent) => {
    e.preventDefault();

    const boatData = {
      id: user?.id, // This will be used as ownerId
      name: formData.name,
      model: formData.model || null,
      manufacturer: formData.manufacturer || null,
      boat_type_id: formData.boatTypeId ? parseInt(formData.boatTypeId) : null,
      year: formData.year ? parseInt(formData.year) : null,
      length_meters: parseFloat(formData.lengthMeters),
      width_meters: formData.widthMeters
        ? parseFloat(formData.widthMeters)
        : null,
      draft_meters: formData.draftMeters
        ? parseFloat(formData.draftMeters)
        : null,
      home_marina: formData.homeMarina || null,
      registration_number: formData.registrationNumber || null,
      insurance_policy_number: formData.insurancePolicyNumber || null,
    };

    if (editingBoat) {
      const updated = await updateBoat(editingBoat.id, boatData);
      if (updated) {
        setEditingBoat(null);
        setShowAddBoat(false);
        resetForm();
      }
    } else {
      const created = await createBoat(boatData);
      if (created) {
        setShowAddBoat(false);
        resetForm();
      }
    }
  };

  const handleEdit = (boat: any) => {
    setEditingBoat(boat);
    setFormData({
      name: boat.name || "",
      model: boat.model || "",
      manufacturer: boat.manufacturer || "",
      boatTypeId: boat.boat_type_id?.toString() || "",
      year: boat.year?.toString() || "",
      lengthMeters: boat.length_meters?.toString() || "",
      widthMeters: boat.width_meters?.toString() || "",
      draftMeters: boat.draft_meters?.toString() || "",
      homeMarina: boat.home_marina || "",
      registrationNumber: boat.registration_number || "",
      insurancePolicyNumber: boat.insurance_policy_number || "",
    });
    setShowAddBoat(true);
  };

  const handleDelete = async (boatId: number) => {
    if (confirm("Are you sure you want to delete this boat?")) {
      await deleteBoat(boatId);
      if (selectedBoat?.id === boatId) {
        setSelectedBoat(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      manufacturer: "",
      boatTypeId: "",
      year: "",
      lengthMeters: "",
      widthMeters: "",
      draftMeters: "",
      homeMarina: "",
      registrationNumber: "",
      insurancePolicyNumber: "",
    });
  };

  const handleCancel = () => {
    setShowAddBoat(false);
    setEditingBoat(null);
    resetForm();
  };

  const handleNext = () => {
    if (!selectedBoat) {
      alert("Please select a boat to continue");
      return;
    }

    if (!marinaData) {
      alert("Marina data not loaded");
      return;
    }

    // Check if slips are available
    if (availableSlips.length === 0) {
      alert(
        "No slips available for your boat during the selected dates. Please select a different boat or change your dates."
      );
      return;
    }

    // Validate boat fits in marina
    if (selectedBoat.length_meters > marinaData.capacity.maxBoatLength) {
      alert(
        `Your boat (${selectedBoat.length_meters}m) exceeds the maximum length allowed at this marina (${marinaData.capacity.maxBoatLength}m)`
      );
      return;
    }

    if (
      selectedBoat.draft_meters &&
      selectedBoat.draft_meters > marinaData.capacity.maxBoatDraft
    ) {
      alert(
        `Your boat's draft (${selectedBoat.draft_meters}m) exceeds the maximum draft allowed at this marina (${marinaData.capacity.maxBoatDraft}m)`
      );
      return;
    }

    onNext();
  };

  if (boatsLoading === "loading") {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" message="Loading your boats..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Boat
        </h2>
        <p className="text-gray-600">
          Choose which boat you'll be bringing to{" "}
          {marinaData?.name || "this marina"}
        </p>
      </div>

      {!showAddBoat ? (
        <>
          {/* Boat List */}
          {boats.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FiAnchor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                You haven't added any boats yet
              </p>
              <button
                onClick={() => setShowAddBoat(true)}
                className="bg-ocean-600 hover:bg-ocean-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Add Your First Boat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boats.map((boat) => (
                  <div
                    key={boat.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedBoat?.id === boat.id
                        ? "border-ocean-600 bg-ocean-50"
                        : "border-gray-200 hover:border-ocean-400"
                    }`}
                    onClick={() => setSelectedBoat(boat)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {boat.name}
                        </h3>
                        {boat.model && (
                          <p className="text-gray-600 text-sm">
                            {boat.manufacturer} {boat.model}
                            {boat.year && ` (${boat.year})`}
                          </p>
                        )}
                        {boat.boat_type_name && (
                          <span className="inline-block mt-2 bg-ocean-100 text-ocean-800 px-2 py-1 rounded text-xs font-medium">
                            {boat.boat_type_name}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(boat);
                          }}
                          className="text-ocean-600 hover:text-ocean-700 p-2"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(boat.id);
                          }}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Length:</span>
                        <p className="font-semibold">{boat.length_meters}m</p>
                      </div>
                      {boat.width_meters && (
                        <div>
                          <span className="text-gray-500">Width:</span>
                          <p className="font-semibold">{boat.width_meters}m</p>
                        </div>
                      )}
                      {boat.draft_meters && (
                        <div>
                          <span className="text-gray-500">Draft:</span>
                          <p className="font-semibold">{boat.draft_meters}m</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAddBoat(true)}
                className="w-full border-2 border-dashed border-ocean-300 hover:border-ocean-500 text-ocean-600 hover:text-ocean-700 font-semibold py-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Add Another Boat
              </button>
            </div>
          )}

          {/* Marina Requirements Info */}
          {selectedBoat && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Marina Requirements
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Max Length:</span>
                    <p className="font-semibold text-blue-900">
                      {marinaData?.capacity?.maxBoatLength || "N/A"}m
                    </p>
                    <p className="text-xs text-blue-600">
                      Your boat: {selectedBoat.length_meters}m{" "}
                      {marinaData?.capacity?.maxBoatLength &&
                      selectedBoat.length_meters <=
                        marinaData.capacity.maxBoatLength
                        ? "✓"
                        : "✗"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Max Draft:</span>
                    <p className="font-semibold text-blue-900">
                      {marinaData?.capacity?.maxBoatDraft || "N/A"}m
                    </p>
                    {selectedBoat.draft_meters && (
                      <p className="text-xs text-blue-600">
                        Your boat: {selectedBoat.draft_meters}m{" "}
                        {marinaData?.capacity?.maxBoatDraft &&
                        selectedBoat.draft_meters <=
                          marinaData.capacity.maxBoatDraft
                          ? "✓"
                          : "✗"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Slip Availability */}
              <div
                className={`rounded-lg p-4 border ${
                  checkingAvailability
                    ? "bg-gray-50 border-gray-200"
                    : slipError
                    ? "bg-red-50 border-red-200"
                    : availableSlips.length > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FiAnchor className="w-4 h-4" />
                  Slip Availability
                </h4>
                {checkingAvailability ? (
                  <p className="text-sm text-gray-600">
                    Checking availability...
                  </p>
                ) : slipError ? (
                  <p className="text-sm text-red-700">{slipError}</p>
                ) : availableSlips.length > 0 ? (
                  <div className="text-sm">
                    <p className="text-green-700 font-semibold mb-2">
                      ✓ {availableSlips.length} slip
                      {availableSlips.length !== 1 ? "s" : ""} available for
                      your boat
                    </p>
                    <p className="text-gray-600 text-xs">
                      Best price: $
                      {Math.min(
                        ...availableSlips.map((s: any) => s.price_per_day)
                      )}
                      /day
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-700">
                    No availability data yet
                  </p>
                )}
              </div>
            </>
          )}

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={
                !selectedBoat ||
                checkingAvailability ||
                availableSlips.length === 0
              }
              className="bg-ocean-600 hover:bg-ocean-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Continue to Booking Details
            </button>
          </div>
        </>
      ) : (
        /* Add/Edit Boat Form */
        <form onSubmit={handleSubmitBoat} className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            {editingBoat ? "Edit Boat" : "Add New Boat"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Boat Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., Sea Explorer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Boat Type
              </label>
              <select
                value={formData.boatTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, boatTypeId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {boatTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., Beneteau"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., Oceanis 46.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (meters) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.lengthMeters}
                onChange={(e) =>
                  setFormData({ ...formData, lengthMeters: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., 14.6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (meters)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.widthMeters}
                onChange={(e) =>
                  setFormData({ ...formData, widthMeters: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., 4.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Draft (meters)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.draftMeters}
                onChange={(e) =>
                  setFormData({ ...formData, draftMeters: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., 2.3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Marina
              </label>
              <input
                type="text"
                value={formData.homeMarina}
                onChange={(e) =>
                  setFormData({ ...formData, homeMarina: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., Marina del Rey"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., CF 1234 AB"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Policy Number
              </label>
              <input
                type="text"
                value={formData.insurancePolicyNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    insurancePolicyNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                placeholder="e.g., POL-123456"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {editingBoat ? "Update Boat" : "Add Boat"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
