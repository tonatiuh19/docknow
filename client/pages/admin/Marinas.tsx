import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, DollarSign, Layers, MapPin, Wrench } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminLayout from "@/components/admin/AdminLayout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteMarinaImage,
  fetchHostMarinaManagement,
  fetchMarinaServicePricing,
  manageMarinaAnchorages,
  manageMarinaImages,
  manageMarinaMoorings,
  manageMarinaPoints,
  manageMarinaSeabeds,
  manageMarinaSlips,
  saveMarinaAmenities,
  saveMarinaFeatures,
  updateMarinaServicePricing,
  uploadMarinaImage,
  type MarinaManagementItem,
} from "@/store/slices/adminMarinasSlice";
import type { BookingServiceType, MarinaServiceTypePricing } from "@shared/api";

const formatPrice = (value: number | null) => {
  if (value === null) return "N/A";
  return `$${value.toFixed(2)}`;
};

const formatRange = (min: number | null, max: number | null) => {
  if (min === null && max === null) return "N/A";
  if (min !== null && max !== null)
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  if (min !== null) return `From ${formatPrice(min)}`;
  return `Up to ${formatPrice(max)}`;
};

const formatYesNo = (value: boolean) => (value ? "Yes" : "No");

const formatDimension = (value: number | null) =>
  value === null ? "N/A" : `${value.toFixed(2)}m`;

const formatTons = (value: number | null) =>
  value === null ? "N/A" : `${value.toFixed(2)}t`;

const EmptyState = ({ text }: { text: string }) => (
  <p className="text-xs text-navy-500">{text}</p>
);

type ModalSection =
  | "marina-features"
  | "amenities"
  | "images"
  | "slips"
  | "anchorages"
  | "seabeds"
  | "moorings"
  | "points"
  | "service-pricing";

const SERVICE_TYPE_LABELS: Record<
  BookingServiceType,
  { label: string; description: string }
> = {
  slip: {
    label: "Slip Docking",
    description: "Standard berthing in a marina slip",
  },
  dry_stack: {
    label: "Dry Stack Storage",
    description: "Dry storage on racks, forklift launched",
  },
  shipyard_maintenance: {
    label: "Shipyard Maintenance",
    description: "Haul-out and maintenance services",
  },
};

const SERVICE_TYPE_ORDER: BookingServiceType[] = [
  "slip",
  "dry_stack",
  "shipyard_maintenance",
];

const ServicePricingModalContent = ({
  marinaId,
  saving,
  onClose,
  onRefresh,
}: {
  marinaId: number;
  saving: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [pricing, setPricing] = useState<MarinaServiceTypePricing[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    setLoadingPricing(true);
    dispatch(fetchMarinaServicePricing(marinaId))
      .unwrap()
      .then((data) => {
        // Ensure all 3 service types are present
        const filled = SERVICE_TYPE_ORDER.map((st) => {
          const existing = data.find((p) => p.service_type === st);
          return (
            existing || {
              service_type: st,
              price_per_day: 0,
              is_available: false,
              description: "",
            }
          );
        });
        setPricing(filled);
      })
      .finally(() => setLoadingPricing(false));
  }, [dispatch, marinaId]);

  const handleChange = (
    serviceType: BookingServiceType,
    field: keyof MarinaServiceTypePricing,
    value: string | boolean | number,
  ) => {
    setPricing((prev) =>
      prev.map((p) =>
        p.service_type === serviceType ? { ...p, [field]: value } : p,
      ),
    );
  };

  const handleSave = async () => {
    setSavingPricing(true);
    try {
      await dispatch(
        updateMarinaServicePricing({ marinaId, pricing }),
      ).unwrap();
      onRefresh();
      onClose();
    } finally {
      setSavingPricing(false);
    }
  };

  if (loadingPricing) {
    return (
      <p className="text-sm text-navy-500 py-4">Loading service pricing...</p>
    );
  }

  return (
    <div className="space-y-4">
      {SERVICE_TYPE_ORDER.map((serviceType) => {
        const row = pricing.find((p) => p.service_type === serviceType)!;
        const { label, description } = SERVICE_TYPE_LABELS[serviceType];
        return (
          <div
            key={serviceType}
            className="border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900 text-sm">{label}</p>
                <p className="text-xs text-navy-500">{description}</p>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={row?.is_available ?? false}
                  onChange={(e) =>
                    handleChange(serviceType, "is_available", e.target.checked)
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-navy-700">Available</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-navy-500 mb-1">
                  Price per day ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row?.price_per_day ?? ""}
                  onChange={(e) =>
                    handleChange(
                      serviceType,
                      "price_per_day",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              <div>
                <label className="block text-xs text-navy-500 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={row?.description ?? ""}
                  onChange={(e) =>
                    handleChange(serviceType, "description", e.target.value)
                  }
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  placeholder="e.g. Includes launch service"
                />
              </div>
            </div>
          </div>
        );
      })}
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={savingPricing || saving}
          className="bg-gradient-to-r from-ocean-600 to-ocean-700 hover:from-ocean-700 hover:to-ocean-800"
        >
          {savingPricing ? "Saving..." : "Save Pricing"}
        </Button>
      </DialogFooter>
    </div>
  );
};

const parseIds = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter((item) => !Number.isNaN(item));

const toNumberOrUndefined = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const SectionModalContent = ({
  section,
  marina,
  saving,
  onClose,
  onRefresh,
}: {
  section: ModalSection;
  marina: MarinaManagementItem;
  saving: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [imageEdits, setImageEdits] = useState<
    Record<number, { title: string; display_order: string }>
  >({});
  const [draggedImageId, setDraggedImageId] = useState<number | null>(null);

  const getImageDraft = (image: MarinaManagementItem["images"][number]) => {
    return (
      imageEdits[image.id] || {
        title: image.title || "",
        display_order: String(image.display_order),
      }
    );
  };

  const sortedMarinaImages = [...marina.images].sort((a, b) => {
    // Cover image (is_primary) always first
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.id - b.id;
  });

  const handleDropReorder = async (targetImageId: number) => {
    if (!draggedImageId || draggedImageId === targetImageId || saving) {
      setDraggedImageId(null);
      return;
    }

    const orderedIds = sortedMarinaImages.map((image) => image.id);
    const fromIndex = orderedIds.indexOf(draggedImageId);
    const toIndex = orderedIds.indexOf(targetImageId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedImageId(null);
      return;
    }

    orderedIds.splice(fromIndex, 1);
    orderedIds.splice(toIndex, 0, draggedImageId);

    // Note: image ordering is not persisted (gallery_image_urls array order
    // reflects upload order). Drag-and-drop is visual only.
    setDraggedImageId(null);
    onRefresh();
  };

  const featuresFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      has_fuel_dock: marina.marina_features?.has_fuel_dock ?? false,
      has_pump_out: marina.marina_features?.has_pump_out ?? false,
      has_haul_out: marina.marina_features?.has_haul_out ?? false,
      has_boat_ramp: marina.marina_features?.has_boat_ramp ?? false,
      has_dry_storage: marina.marina_features?.has_dry_storage ?? false,
      has_live_aboard: marina.marina_features?.has_live_aboard ?? false,
      accepts_transients: marina.marina_features?.accepts_transients ?? true,
      accepts_megayachts: marina.marina_features?.accepts_megayachts ?? false,
      max_haul_out_weight_tons:
        marina.marina_features?.max_haul_out_weight_tons?.toString() || "",
    },
    validationSchema: Yup.object({
      max_haul_out_weight_tons: Yup.number().min(0).nullable(),
    }),
    onSubmit: async (values) => {
      await dispatch(
        saveMarinaFeatures({
          marinaId: marina.id,
          features: {
            ...values,
            max_haul_out_weight_tons: toNumberOrUndefined(
              values.max_haul_out_weight_tons,
            ),
          },
        }),
      );
      onRefresh();
      onClose();
    },
  });

  const amenitiesFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      amenity_ids: marina.amenities.map((item) => item.amenity_id).join(", "),
    },
    validationSchema: Yup.object({
      amenity_ids: Yup.string().required("Amenity IDs are required"),
    }),
    onSubmit: async (values) => {
      await dispatch(
        saveMarinaAmenities({
          marinaId: marina.id,
          amenityIds: parseIds(values.amenity_ids),
        }),
      );
      onRefresh();
      onClose();
    },
  });

  const slipsFormik = useFormik({
    initialValues: {
      action: "create",
      slipId: "",
      slip_number: "",
      length_meters: "",
      width_meters: "",
      depth_meters: "",
      price_per_day: "",
      power_capacity_amps: "",
      notes: "",
      is_available: true,
      is_reserved: false,
      has_power: true,
      has_water: true,
    },
    validationSchema: Yup.object({
      action: Yup.string().required(),
      slipId: Yup.string().when("action", {
        is: (value: string) => value !== "create",
        then: (schema) => schema.required("Slip ID is required"),
      }),
    }),
    onSubmit: async (values) => {
      const payload: any = { action: values.action };
      if (values.action === "create") {
        payload.marinaId = marina.id;
      }
      if (values.action !== "create") {
        payload.slipId = Number(values.slipId);
      }
      if (values.action !== "delete") {
        payload.slip = {
          slip_number: values.slip_number || undefined,
          length_meters: toNumberOrUndefined(values.length_meters),
          width_meters: toNumberOrUndefined(values.width_meters),
          depth_meters: toNumberOrUndefined(values.depth_meters),
          price_per_day: toNumberOrUndefined(values.price_per_day),
          power_capacity_amps: toNumberOrUndefined(values.power_capacity_amps),
          notes: values.notes || undefined,
          is_available: values.is_available,
          is_reserved: values.is_reserved,
          has_power: values.has_power,
          has_water: values.has_water,
        };
      }
      await dispatch(manageMarinaSlips(payload));
      onRefresh();
      onClose();
    },
  });

  const anchoragesFormik = useFormik({
    initialValues: {
      action: "create",
      anchorageId: "",
      anchorage_type_id: "",
      name: "",
      description: "",
      latitude: "",
      longitude: "",
      max_depth_meters: "",
      min_depth_meters: "",
      capacity: "",
      price_per_day: "",
      protection_level: "good",
      is_available: true,
    },
    validationSchema: Yup.object({
      action: Yup.string().required(),
      anchorageId: Yup.string().when("action", {
        is: (value: string) => value !== "create",
        then: (schema) => schema.required("Anchorage ID is required"),
      }),
    }),
    onSubmit: async (values) => {
      const payload: any = { action: values.action };
      if (values.action === "create") payload.marinaId = marina.id;
      if (values.action !== "create")
        payload.anchorageId = Number(values.anchorageId);
      if (values.action !== "delete") {
        payload.anchorage = {
          anchorage_type_id: toNumberOrUndefined(values.anchorage_type_id),
          name: values.name || undefined,
          description: values.description || undefined,
          latitude: toNumberOrUndefined(values.latitude),
          longitude: toNumberOrUndefined(values.longitude),
          max_depth_meters: toNumberOrUndefined(values.max_depth_meters),
          min_depth_meters: toNumberOrUndefined(values.min_depth_meters),
          capacity: toNumberOrUndefined(values.capacity),
          price_per_day: toNumberOrUndefined(values.price_per_day),
          protection_level: values.protection_level || undefined,
          is_available: values.is_available,
        };
      }
      await dispatch(manageMarinaAnchorages(payload));
      onRefresh();
      onClose();
    },
  });

  const seabedsFormik = useFormik({
    initialValues: {
      action: "create",
      seabedId: "",
      seabed_type_id: "",
      anchorage_id: "",
      depth_meters: "",
      description: "",
      notes: "",
    },
    validationSchema: Yup.object({
      action: Yup.string().required(),
      seabedId: Yup.string().when("action", {
        is: (value: string) => value !== "create",
        then: (schema) => schema.required("Seabed ID is required"),
      }),
    }),
    onSubmit: async (values) => {
      const payload: any = { action: values.action };
      if (values.action === "create") payload.marinaId = marina.id;
      if (values.action !== "create")
        payload.seabedId = Number(values.seabedId);
      if (values.action !== "delete") {
        payload.seabed = {
          seabed_type_id: toNumberOrUndefined(values.seabed_type_id),
          anchorage_id: toNumberOrUndefined(values.anchorage_id),
          depth_meters: toNumberOrUndefined(values.depth_meters),
          description: values.description || undefined,
          notes: values.notes || undefined,
        };
      }
      await dispatch(manageMarinaSeabeds(payload));
      onRefresh();
      onClose();
    },
  });

  const mooringsFormik = useFormik({
    initialValues: {
      action: "create",
      mooringId: "",
      mooring_type_id: "",
      mooring_number: "",
      description: "",
      max_boat_length_meters: "",
      max_boat_weight_tons: "",
      depth_meters: "",
      price_per_day: "",
      latitude: "",
      longitude: "",
      is_available: true,
    },
    validationSchema: Yup.object({
      action: Yup.string().required(),
      mooringId: Yup.string().when("action", {
        is: (value: string) => value !== "create",
        then: (schema) => schema.required("Mooring ID is required"),
      }),
    }),
    onSubmit: async (values) => {
      const payload: any = { action: values.action };
      if (values.action === "create") payload.marinaId = marina.id;
      if (values.action !== "create")
        payload.mooringId = Number(values.mooringId);
      if (values.action !== "delete") {
        payload.mooring = {
          mooring_type_id: toNumberOrUndefined(values.mooring_type_id),
          mooring_number: values.mooring_number || undefined,
          description: values.description || undefined,
          max_boat_length_meters: toNumberOrUndefined(
            values.max_boat_length_meters,
          ),
          max_boat_weight_tons: toNumberOrUndefined(
            values.max_boat_weight_tons,
          ),
          depth_meters: toNumberOrUndefined(values.depth_meters),
          price_per_day: toNumberOrUndefined(values.price_per_day),
          latitude: toNumberOrUndefined(values.latitude),
          longitude: toNumberOrUndefined(values.longitude),
          is_available: values.is_available,
        };
      }
      await dispatch(manageMarinaMoorings(payload));
      onRefresh();
      onClose();
    },
  });

  const pointsFormik = useFormik({
    initialValues: {
      action: "create",
      pointId: "",
      point_type_id: "",
      name: "",
      description: "",
      latitude: "",
      longitude: "",
      is_public: true,
      is_active: true,
      contact_info: "",
      operating_hours: "",
    },
    validationSchema: Yup.object({
      action: Yup.string().required(),
      pointId: Yup.string().when("action", {
        is: (value: string) => value !== "create",
        then: (schema) => schema.required("Point ID is required"),
      }),
    }),
    onSubmit: async (values) => {
      const payload: any = { action: values.action };
      if (values.action === "create") payload.marinaId = marina.id;
      if (values.action !== "create") payload.pointId = Number(values.pointId);
      if (values.action !== "delete") {
        payload.point = {
          point_type_id: toNumberOrUndefined(values.point_type_id),
          name: values.name || undefined,
          description: values.description || undefined,
          latitude: toNumberOrUndefined(values.latitude),
          longitude: toNumberOrUndefined(values.longitude),
          is_public: values.is_public,
          is_active: values.is_active,
          contact_info: values.contact_info || undefined,
          operating_hours: values.operating_hours || undefined,
        };
      }
      await dispatch(manageMarinaPoints(payload));
      onRefresh();
      onClose();
    },
  });

  const imagesFormik = useFormik({
    initialValues: {
      title: "",
      display_order: "0",
      image_type: "extra",
      file: null as File | null,
    },
    validationSchema: Yup.object({
      title: Yup.string().max(255),
      display_order: Yup.number().min(0).required("Display order is required"),
      image_type: Yup.string().oneOf(["main", "extra"]).required(),
      file: Yup.mixed().required("Image file is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!values.file) return;

      await dispatch(
        uploadMarinaImage({
          marinaId: marina.id,
          file: values.file,
          imageType: values.image_type as "main" | "extra",
          title: values.title || undefined,
          displayOrder: Number(values.display_order),
        }),
      );

      resetForm();
      onRefresh();
    },
  });

  if (section === "marina-features") {
    return (
      <form onSubmit={featuresFormik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["has_fuel_dock", "Fuel Dock"],
            ["has_pump_out", "Pump Out"],
            ["has_haul_out", "Haul Out"],
            ["has_boat_ramp", "Boat Ramp"],
            ["has_dry_storage", "Dry Storage"],
            ["has_live_aboard", "Live Aboard"],
            ["accepts_transients", "Accepts Transients"],
            ["accepts_megayachts", "Accepts Megayachts"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={name}
                checked={(featuresFormik.values as any)[name]}
                onChange={featuresFormik.handleChange}
              />
              {label}
            </label>
          ))}
        </div>
        <Input
          name="max_haul_out_weight_tons"
          placeholder="Max haul out weight (tons)"
          value={featuresFormik.values.max_haul_out_weight_tons}
          onChange={featuresFormik.handleChange}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" disabled={saving}>
            Save Features
          </Button>
        </DialogFooter>
      </form>
    );
  }

  if (section === "amenities") {
    return (
      <form onSubmit={amenitiesFormik.handleSubmit} className="space-y-4">
        <Textarea
          name="amenity_ids"
          placeholder="Amenity IDs separated by commas (e.g. 1,2,3)"
          value={amenitiesFormik.values.amenity_ids}
          onChange={amenitiesFormik.handleChange}
          rows={5}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" disabled={saving}>
            Save Amenities
          </Button>
        </DialogFooter>
      </form>
    );
  }

  if (section === "images") {
    return (
      <div className="space-y-4">
        <form onSubmit={imagesFormik.handleSubmit} className="space-y-3">
          <Input
            name="title"
            placeholder="Image title (optional)"
            value={imagesFormik.values.title}
            onChange={imagesFormik.handleChange}
          />
          <Input
            name="display_order"
            type="number"
            min={0}
            placeholder="Display order"
            value={imagesFormik.values.display_order}
            onChange={imagesFormik.handleChange}
          />
          <select
            name="image_type"
            className="w-full h-10 px-3 rounded-md border border-slate-300"
            value={imagesFormik.values.image_type}
            onChange={imagesFormik.handleChange}
          >
            <option value="extra">Extra image</option>
            <option value="main">Main image</option>
          </select>
          <Input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => {
              imagesFormik.setFieldValue(
                "file",
                event.currentTarget.files?.[0] || null,
              );
            }}
          />
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              Upload Image
            </Button>
          </DialogFooter>
        </form>

        {marina.images.length > 0 ? (
          <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
            {sortedMarinaImages.map((image) => (
              <div
                key={`marina-image-${image.id}`}
                draggable={!saving}
                onDragStart={() => setDraggedImageId(image.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={async (event) => {
                  event.preventDefault();
                  await handleDropReorder(image.id);
                }}
                onDragEnd={() => setDraggedImageId(null)}
                className={`rounded-lg border p-2 flex items-center gap-3 cursor-grab active:cursor-grabbing ${
                  draggedImageId === image.id
                    ? "border-ocean-400 bg-ocean-50"
                    : "border-slate-200"
                }`}
              >
                <img
                  src={image.image_url}
                  alt={image.title || "Marina image"}
                  className="w-20 h-14 object-cover rounded-md border border-slate-200"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <Input
                    value={getImageDraft(image).title}
                    onChange={(event) => {
                      const draft = getImageDraft(image);
                      setImageEdits((prev) => ({
                        ...prev,
                        [image.id]: {
                          ...draft,
                          title: event.target.value,
                        },
                      }));
                    }}
                    placeholder="Image title"
                    className="h-8 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={getImageDraft(image).display_order}
                      onChange={(event) => {
                        const draft = getImageDraft(image);
                        setImageEdits((prev) => ({
                          ...prev,
                          [image.id]: {
                            ...draft,
                            display_order: event.target.value,
                          },
                        }));
                      }}
                      className="h-8 text-xs w-24"
                    />
                    <p className="text-[11px] text-navy-500 truncate">
                      {image.is_primary ? "Primary" : "Extra"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={async () => {
                        // Reordering not persisted; display only.
                        onRefresh();
                      }}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={async () => {
                        // Reordering not persisted; display only.
                        onRefresh();
                      }}
                    >
                      Down
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={async () => {
                        // Title editing not persisted (images stored as URLs only).
                        onRefresh();
                      }}
                    >
                      Save
                    </Button>
                  </div>

                  {!image.is_primary && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={async () => {
                        await dispatch(
                          manageMarinaImages({
                            action: "create",
                            marinaId: marina.id,
                            image: {
                              image_url: image.image_url,
                              is_primary: true,
                            },
                          }),
                        );
                        onRefresh();
                      }}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={async () => {
                      await dispatch(
                        deleteMarinaImage({
                          marinaId: marina.id,
                          imageUrl: image.image_url,
                        }),
                      );
                      onRefresh();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No images configured." />
        )}

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </div>
    );
  }

  const sectionMap: Record<
    Exclude<
      ModalSection,
      "marina-features" | "amenities" | "images" | "service-pricing"
    >,
    { formik: any; idLabel: string; idField: string }
  > = {
    slips: { formik: slipsFormik, idLabel: "Slip ID", idField: "slipId" },
    anchorages: {
      formik: anchoragesFormik,
      idLabel: "Anchorage ID",
      idField: "anchorageId",
    },
    seabeds: {
      formik: seabedsFormik,
      idLabel: "Seabed ID",
      idField: "seabedId",
    },
    moorings: {
      formik: mooringsFormik,
      idLabel: "Mooring ID",
      idField: "mooringId",
    },
    points: { formik: pointsFormik, idLabel: "Point ID", idField: "pointId" },
  };

  const config = sectionMap[section as keyof typeof sectionMap];
  const formik = config.formik;

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3">
      <select
        name="action"
        className="w-full h-10 px-3 rounded-md border border-slate-300"
        value={formik.values.action}
        onChange={formik.handleChange}
      >
        <option value="create">Create</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>

      {formik.values.action !== "create" && (
        <Input
          name={config.idField}
          placeholder={config.idLabel}
          value={formik.values[config.idField]}
          onChange={formik.handleChange}
        />
      )}

      {formik.values.action !== "delete" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.keys(formik.values)
            .filter(
              (field) =>
                !["action", config.idField].includes(field) &&
                typeof formik.values[field] !== "boolean",
            )
            .map((field) => (
              <Input
                key={field}
                name={field}
                placeholder={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
              />
            ))}
        </div>
      )}

      {formik.values.action !== "delete" && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.keys(formik.values)
            .filter((field) => typeof formik.values[field] === "boolean")
            .map((field) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field}
                  checked={formik.values[field]}
                  onChange={formik.handleChange}
                />
                {field}
              </label>
            ))}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          Close
        </Button>
        <Button type="submit" disabled={saving}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};

const AdminMarinas = () => {
  const dispatch = useAppDispatch();
  const { marinas, isLoading, saving, error } = useAppSelector(
    (state) => state.adminMarinas,
  );
  const [activeModal, setActiveModal] = useState<{
    marinaId: number;
    marinaName: string;
    section: ModalSection;
  } | null>(null);

  const selectedMarina = useMemo(
    () => marinas.find((item) => item.id === activeModal?.marinaId) || null,
    [activeModal?.marinaId, marinas],
  );

  useEffect(() => {
    dispatch(fetchHostMarinaManagement());
  }, [dispatch]);

  return (
    <AdminLayout>
      <MetaHelmet
        title="Admin Marina Management"
        description="Manage slips, features, amenities, anchorages, seabeds, moorings, and points for your marinas in DockNow admin."
        noindex
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-navy-900 mb-2"
            >
              Marina Management
            </motion.h1>
            <p className="text-navy-600">
              Manage existing marina references: slips, amenities, seabed,
              mooring, and pricing
            </p>
          </div>
        </div>

        {isLoading ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-8 text-navy-600">
              Loading marina management data...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-8 text-red-600">{error}</CardContent>
          </Card>
        ) : marinas.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="py-8 text-navy-600">
              No managed marinas found for this account.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {marinas.map((marina, index) => (
              <motion.div
                key={marina.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl text-navy-900 mb-2 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-ocean-600" />
                          {marina.name}
                        </CardTitle>
                        <p className="text-sm text-navy-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[marina.city, marina.state, marina.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                      <Badge
                        className={
                          marina.is_active
                            ? "bg-ocean-100 text-ocean-700 border-ocean-200"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }
                      >
                        {marina.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-navy-500">Total Slips</p>
                        <p className="text-lg font-bold text-navy-900">
                          {marina.slips.length}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-navy-500">Available</p>
                        <p className="text-lg font-bold text-navy-900">
                          {
                            marina.slips.filter(
                              (slip) => slip.is_available && !slip.is_reserved,
                            ).length
                          }
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-navy-500">Marina Price</p>
                        <p className="text-lg font-bold text-navy-900">
                          {formatPrice(marina.marina_price_per_day)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-xs text-navy-500">Slip pricing</p>
                        <p className="text-sm font-semibold text-navy-900">
                          {formatRange(
                            marina.pricing.slips.min,
                            marina.pricing.slips.max,
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-xs text-navy-500">Mooring pricing</p>
                        <p className="text-sm font-semibold text-navy-900">
                          {formatRange(
                            marina.pricing.moorings.min,
                            marina.pricing.moorings.max,
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-xs text-navy-500">
                          Anchorage pricing
                        </p>
                        <p className="text-sm font-semibold text-navy-900">
                          {formatRange(
                            marina.pricing.anchorages.min,
                            marina.pricing.anchorages.max,
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Marina Features
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "marina-features",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      {marina.marina_features ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          <Badge variant="outline">
                            Fuel Dock:{" "}
                            {formatYesNo(marina.marina_features.has_fuel_dock)}
                          </Badge>
                          <Badge variant="outline">
                            Pump Out:{" "}
                            {formatYesNo(marina.marina_features.has_pump_out)}
                          </Badge>
                          <Badge variant="outline">
                            Haul Out:{" "}
                            {formatYesNo(marina.marina_features.has_haul_out)}
                          </Badge>
                          <Badge variant="outline">
                            Boat Ramp:{" "}
                            {formatYesNo(marina.marina_features.has_boat_ramp)}
                          </Badge>
                          <Badge variant="outline">
                            Dry Storage:{" "}
                            {formatYesNo(
                              marina.marina_features.has_dry_storage,
                            )}
                          </Badge>
                          <Badge variant="outline">
                            Live Aboard:{" "}
                            {formatYesNo(
                              marina.marina_features.has_live_aboard,
                            )}
                          </Badge>
                          <Badge variant="outline">
                            Transients:{" "}
                            {formatYesNo(
                              marina.marina_features.accepts_transients,
                            )}
                          </Badge>
                          <Badge variant="outline">
                            Megayachts:{" "}
                            {formatYesNo(
                              marina.marina_features.accepts_megayachts,
                            )}
                          </Badge>
                          <Badge variant="outline">
                            Max Haul:{" "}
                            {formatTons(
                              marina.marina_features.max_haul_out_weight_tons,
                            )}
                          </Badge>
                        </div>
                      ) : (
                        <EmptyState text="No marina features configured." />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Amenities ({marina.amenities.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "amenities",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {marina.amenities.length > 0 ? (
                          marina.amenities.map((amenity) => (
                            <Badge
                              key={`${marina.id}-amenity-${amenity.id}`}
                              variant="outline"
                              className="text-xs"
                            >
                              {amenity.name}
                            </Badge>
                          ))
                        ) : (
                          <EmptyState text="No amenities configured." />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Images ({marina.images.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "images",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>

                      {marina.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {marina.images.slice(0, 8).map((image) => (
                            <div
                              key={`${marina.id}-image-${image.id}`}
                              className="rounded-lg border border-slate-200 p-1.5"
                            >
                              <img
                                src={image.image_url}
                                alt={image.title || `Marina image ${image.id}`}
                                className="w-full h-20 object-cover rounded-md"
                              />
                              <p className="text-[10px] text-navy-600 mt-1 truncate">
                                {image.title ||
                                  (image.is_primary ? "Primary" : "Extra")}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="No images configured." />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Slips ({marina.slips.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "slips",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      {marina.slips.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Slip</TableHead>
                              <TableHead>Size (L/W/D)</TableHead>
                              <TableHead>Price/Day</TableHead>
                              <TableHead>Power/Water</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marina.slips.map((slip) => (
                              <TableRow key={`${marina.id}-slip-${slip.id}`}>
                                <TableCell className="font-medium">
                                  {slip.slip_number}
                                </TableCell>
                                <TableCell>
                                  {formatDimension(slip.length_meters)} /{" "}
                                  {formatDimension(slip.width_meters)} /{" "}
                                  {formatDimension(slip.depth_meters)}
                                </TableCell>
                                <TableCell>
                                  {formatPrice(slip.price_per_day)}
                                </TableCell>
                                <TableCell>
                                  {formatYesNo(slip.has_power)} /{" "}
                                  {formatYesNo(slip.has_water)}
                                </TableCell>
                                <TableCell>
                                  {slip.is_available && !slip.is_reserved
                                    ? "Available"
                                    : "Unavailable"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <EmptyState text="No slips configured." />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Anchorages ({marina.anchorages.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "anchorages",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      {marina.anchorages.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Capacity</TableHead>
                              <TableHead>Price/Day</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marina.anchorages.map((anchorage) => (
                              <TableRow
                                key={`${marina.id}-anchorage-${anchorage.id}`}
                              >
                                <TableCell className="font-medium">
                                  {anchorage.name}
                                </TableCell>
                                <TableCell>
                                  {anchorage.anchorage_type_name}
                                </TableCell>
                                <TableCell>
                                  {anchorage.capacity ?? "N/A"}
                                </TableCell>
                                <TableCell>
                                  {formatPrice(anchorage.price_per_day)}
                                </TableCell>
                                <TableCell>
                                  {anchorage.is_available
                                    ? "Available"
                                    : "Unavailable"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <EmptyState text="No anchorages configured." />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Seabed ({marina.seabeds.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "seabeds",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      {marina.seabeds.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Holding</TableHead>
                              <TableHead>Depth</TableHead>
                              <TableHead>Anchorage ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marina.seabeds.map((seabed) => (
                              <TableRow
                                key={`${marina.id}-seabed-${seabed.id}`}
                              >
                                <TableCell className="font-medium">
                                  {seabed.seabed_type_name}
                                </TableCell>
                                <TableCell>{seabed.holding_quality}</TableCell>
                                <TableCell>
                                  {formatDimension(seabed.depth_meters)}
                                </TableCell>
                                <TableCell>
                                  {seabed.anchorage_id ?? "N/A"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <EmptyState text="No seabed entries configured." />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Moorings ({marina.moorings.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "moorings",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      {marina.moorings.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Number</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Max Length</TableHead>
                              <TableHead>Price/Day</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marina.moorings.map((mooring) => (
                              <TableRow
                                key={`${marina.id}-mooring-${mooring.id}`}
                              >
                                <TableCell className="font-medium">
                                  {mooring.mooring_number}
                                </TableCell>
                                <TableCell>
                                  {mooring.mooring_type_name}
                                </TableCell>
                                <TableCell>
                                  {formatDimension(
                                    mooring.max_boat_length_meters,
                                  )}
                                </TableCell>
                                <TableCell>
                                  {formatPrice(mooring.price_per_day)}
                                </TableCell>
                                <TableCell>
                                  {mooring.is_available
                                    ? "Available"
                                    : "Unavailable"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <EmptyState text="No moorings configured." />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-ocean-600" />
                          Service Type Pricing
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "service-pricing",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SERVICE_TYPE_ORDER.map((st) => {
                          const { label } = SERVICE_TYPE_LABELS[st];
                          const icon =
                            st === "slip" ? (
                              <Layers className="w-3.5 h-3.5" />
                            ) : (
                              <Wrench className="w-3.5 h-3.5" />
                            );
                          return (
                            <div
                              key={st}
                              className="rounded-lg border border-slate-200 p-3 flex items-center gap-2"
                            >
                              <span className="text-ocean-600">{icon}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-navy-900 truncate">
                                  {label}
                                </p>
                                <p className="text-xs text-navy-500">
                                  Configure in CRM
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-navy-900">
                          Points ({marina.points.length})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActiveModal({
                              marinaId: marina.id,
                              marinaName: marina.name,
                              section: "points",
                            })
                          }
                        >
                          Manage
                        </Button>
                      </div>
                      {marina.points.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Public</TableHead>
                              <TableHead>Active</TableHead>
                              <TableHead>Hours</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {marina.points.map((point) => (
                              <TableRow key={`${marina.id}-point-${point.id}`}>
                                <TableCell className="font-medium">
                                  {point.name}
                                </TableCell>
                                <TableCell>{point.point_type_name}</TableCell>
                                <TableCell>
                                  {formatYesNo(point.is_public)}
                                </TableCell>
                                <TableCell>
                                  {formatYesNo(point.is_active)}
                                </TableCell>
                                <TableCell>
                                  {point.operating_hours || "N/A"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <EmptyState text="No points configured." />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog
          open={Boolean(activeModal)}
          onOpenChange={() => setActiveModal(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {activeModal?.section.replace("-", " ")} Management
              </DialogTitle>
              <DialogDescription>
                Manage {activeModal?.marinaName} in this subsection.
              </DialogDescription>
            </DialogHeader>

            {activeModal && selectedMarina ? (
              activeModal.section === "service-pricing" ? (
                <ServicePricingModalContent
                  marinaId={activeModal.marinaId}
                  saving={saving}
                  onClose={() => setActiveModal(null)}
                  onRefresh={() => dispatch(fetchHostMarinaManagement())}
                />
              ) : (
                <SectionModalContent
                  section={activeModal.section}
                  marina={selectedMarina}
                  saving={saving}
                  onClose={() => setActiveModal(null)}
                  onRefresh={() => {
                    dispatch(fetchHostMarinaManagement());
                  }}
                />
              )
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMarinas;
