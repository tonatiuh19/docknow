import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, Clock3, Lock, Plus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createHostBlockedDate,
  fetchHostBlockedDates,
  fetchHostBookings,
  fetchHostMarinasForBookings,
  fetchHostSlipsForBookings,
  setFilters,
} from "@/store/slices/adminBookingsSlice";

type ViewMode = "day" | "week" | "month";

const blockDateSchema = Yup.object({
  marinaId: Yup.number().required("Marina is required"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string()
    .required("End date is required")
    .test(
      "end-after-start",
      "End date must be on or after start date",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
      },
    ),
  reason: Yup.string().trim().required("Reason is required").max(255),
  startTime: Yup.string().when("isAllDay", {
    is: false,
    then: (schema) => schema.required("Start time is required"),
  }),
  endTime: Yup.string().when("isAllDay", {
    is: false,
    then: (schema) =>
      schema
        .required("End time is required")
        .test(
          "end-time-after-start-time",
          "End time must be after start time",
          function (value) {
            const { startTime, isAllDay } = this.parent;
            if (isAllDay || !startTime || !value) return true;
            return value > startTime;
          },
        ),
  }),
});

const AdminBookings = () => {
  const dispatch = useAppDispatch();
  const {
    bookings,
    blockedDates,
    marinas,
    slips,
    isLoading,
    creatingBlock,
    error,
    filters,
  } = useAppSelector((state) => state.adminBookings);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchHostBookings());
    dispatch(fetchHostBlockedDates(undefined));
    dispatch(fetchHostMarinasForBookings());
    dispatch(fetchHostSlipsForBookings(undefined));
  }, [dispatch]);

  const blockFormik = useFormik({
    initialValues: {
      marinaId: "",
      slipId: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      reason: "",
      isAllDay: true,
      startTime: "",
      endTime: "",
    },
    validationSchema: blockDateSchema,
    onSubmit: async (values, { resetForm }) => {
      await dispatch(
        createHostBlockedDate({
          marinaId: Number(values.marinaId),
          slipId: values.slipId ? Number(values.slipId) : null,
          startDate: values.startDate,
          endDate: values.endDate,
          reason: values.reason,
          isAllDay: values.isAllDay,
          startTime: values.isAllDay ? undefined : values.startTime,
          endTime: values.isAllDay ? undefined : values.endTime,
        }),
      );
      await dispatch(fetchHostBlockedDates(undefined));
      setIsBlockModalOpen(false);
      setWizardStep(1);
      resetForm();
    },
  });

  useEffect(() => {
    if (blockFormik.values.marinaId) {
      dispatch(
        fetchHostSlipsForBookings({
          marinaId: Number(blockFormik.values.marinaId),
        }),
      );
    }
  }, [blockFormik.values.marinaId, dispatch]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.marina_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filters.status === "all" || booking.status === filters.status;
      const matchesMarina =
        filters.marinaId === "all" ||
        String(booking.marina_id) === filters.marinaId;
      return matchesSearch && matchesStatus && matchesMarina;
    });
  }, [bookings, searchTerm, filters.status, filters.marinaId]);

  const filteredBlockedDates = useMemo(() => {
    return blockedDates.filter((item) => {
      if (filters.marinaId === "all") return true;
      return String(item.marina_id) === filters.marinaId;
    });
  }, [blockedDates, filters.marinaId]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return bookings.find((booking) => booking.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  const eventsByDay = useMemo(() => {
    type CalendarEvent = {
      id: string;
      label: string;
      type: "booking" | "blocked";
      bookingId?: number;
    };

    const map = new Map<string, Array<CalendarEvent>>();

    filteredBookings.forEach((booking) => {
      const start = parseISO(booking.check_in_date);
      const end = parseISO(booking.check_out_date);
      let current = startOfDay(start);
      while (current <= end) {
        const key = format(current, "yyyy-MM-dd");
        const list = map.get(key) || [];
        list.push({
          id: `booking-${booking.id}-${key}`,
          label: `${booking.guest_name} · #${booking.id}`,
          type: "booking",
          bookingId: booking.id,
        });
        map.set(key, list);
        current = addDays(current, 1);
      }
    });

    filteredBlockedDates.forEach((block) => {
      const key = format(parseISO(block.blocked_date), "yyyy-MM-dd");
      const list = map.get(key) || [];
      list.push({
        id: `blocked-${block.id}`,
        label: `Blocked · ${block.reason}`,
        type: "blocked",
      });
      map.set(key, list);
    });

    return map;
  }, [filteredBookings, filteredBlockedDates]);

  const visibleDays = useMemo(() => {
    if (viewMode === "day") {
      return [startOfDay(cursorDate)];
    }
    if (viewMode === "week") {
      const start = startOfWeek(cursorDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, index) => addDays(start, index));
    }

    const monthStart = startOfMonth(cursorDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(cursorDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let current = gridStart;
    while (current <= gridEnd) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  }, [viewMode, cursorDate]);

  const handlePrev = () => {
    if (viewMode === "day") setCursorDate(addDays(cursorDate, -1));
    if (viewMode === "week") setCursorDate(subWeeks(cursorDate, 1));
    if (viewMode === "month") setCursorDate(subMonths(cursorDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "day") setCursorDate(addDays(cursorDate, 1));
    if (viewMode === "week") setCursorDate(addWeeks(cursorDate, 1));
    if (viewMode === "month") setCursorDate(addMonths(cursorDate, 1));
  };

  const selectedMarinaSlips = slips.filter(
    (slip) =>
      !blockFormik.values.marinaId ||
      Number(blockFormik.values.marinaId) === slip.marina_id,
  );

  return (
    <AdminLayout>
      <MetaHelmet
        title="Admin Calendar"
        description="View reservations in day, week, and month calendar views and manage blocked dates from the DockNow admin panel."
        noindex
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-navy-900 mb-2"
            >
              Calendar
            </motion.h1>
            <p className="text-navy-600">
              Calendar view for bookings and blocked dates (day/week/month)
            </p>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrev}>
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() => setCursorDate(new Date())}
              >
                Today
              </Button>
              <Button variant="outline" onClick={handleNext}>
                Next
              </Button>
              <div className="ml-2 font-semibold text-navy-900">
                {viewMode === "day" && format(cursorDate, "PPP")}
                {viewMode === "week" &&
                  `${format(startOfWeek(cursorDate, { weekStartsOn: 1 }), "MMM d")} - ${format(addDays(startOfWeek(cursorDate, { weekStartsOn: 1 }), 6), "MMM d, yyyy")}`}
                {viewMode === "month" && format(cursorDate, "MMMM yyyy")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={viewMode === "day" ? "default" : "outline"}
                onClick={() => setViewMode("day")}
              >
                Day
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                onClick={() => setViewMode("week")}
              >
                Week
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search guest or marina"
            />
            <Select
              value={filters.status}
              onValueChange={(value) => dispatch(setFilters({ status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.marinaId}
              onValueChange={(value) => {
                dispatch(setFilters({ marinaId: value }));
                if (value === "all") {
                  dispatch(fetchHostBlockedDates(undefined));
                } else {
                  dispatch(fetchHostBlockedDates({ marinaId: Number(value) }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Marina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marinas</SelectItem>
                {marinas.map((marina) => (
                  <SelectItem key={marina.id} value={String(marina.id)}>
                    {marina.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="bg-gradient-ocean w-full"
              onClick={() => setIsBlockModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Block Date
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
            <CardTitle className="flex items-center gap-2 text-navy-900">
              <CalendarDays className="w-5 h-5 text-ocean-600" />
              Bookings & Blocked Dates Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-navy-500">
                Loading calendar...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className={`grid ${viewMode === "month" ? "grid-cols-7" : viewMode === "week" ? "grid-cols-7" : "grid-cols-1"} ${viewMode !== "day" ? "min-w-[560px]" : ""}`}
                >
                  {visibleDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const events = eventsByDay.get(key) || [];
                    const isCurrentMonth =
                      format(day, "MM") === format(cursorDate, "MM");

                    return (
                      <div
                        key={key}
                        className={`min-h-[140px] border border-slate-100 p-3 ${
                          viewMode === "month" && !isCurrentMonth
                            ? "bg-slate-50"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-navy-700">
                            {format(
                              day,
                              viewMode === "day" ? "EEEE, MMM d" : "EEE d",
                            )}
                          </p>
                          {events.length > 0 && (
                            <Badge className="bg-ocean-100 text-ocean-700 border-ocean-200">
                              {events.length}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          {events.slice(0, 4).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs px-2 py-1 rounded-md ${
                                event.type === "booking"
                                  ? "bg-ocean-100 text-ocean-800"
                                  : "bg-slate-200 text-slate-800"
                              }`}
                              onClick={() => {
                                if (
                                  event.type === "booking" &&
                                  event.bookingId
                                ) {
                                  setSelectedBookingId(event.bookingId);
                                }
                              }}
                              role={
                                event.type === "booking" ? "button" : undefined
                              }
                              tabIndex={event.type === "booking" ? 0 : -1}
                              onKeyDown={(keyboardEvent) => {
                                if (
                                  event.type === "booking" &&
                                  event.bookingId &&
                                  (keyboardEvent.key === "Enter" ||
                                    keyboardEvent.key === " ")
                                ) {
                                  keyboardEvent.preventDefault();
                                  setSelectedBookingId(event.bookingId);
                                }
                              }}
                            >
                              {event.type === "booking" ? "🛥" : "⛔"}{" "}
                              {event.label}
                            </div>
                          ))}
                          {events.length > 4 && (
                            <p className="text-xs text-navy-500">
                              +{events.length - 4} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-navy-900">
              <Lock className="w-5 h-5 text-slate-600" />
              Upcoming Blocked Dates ({filteredBlockedDates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBlockedDates.length === 0 ? (
              <p className="text-sm text-navy-500">
                No blocked dates configured.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredBlockedDates.slice(0, 8).map((block) => (
                  <div
                    key={block.id}
                    className="rounded-lg border border-slate-200 p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy-900">
                        {block.marina_name}{" "}
                        {block.slip_number
                          ? `· Slip ${block.slip_number}`
                          : "· All Slips"}
                      </p>
                      <p className="text-xs text-navy-500">
                        {format(parseISO(block.blocked_date), "PPP")} ·{" "}
                        {block.reason}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {block.is_all_day
                        ? "All Day"
                        : `${block.start_time || "--"} - ${block.end_time || "--"}`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </CardContent>
        </Card>

        <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
            <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-navy-50 to-ocean-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl text-navy-900">
                    Create Blocked Date
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1 text-navy-600">
                    Create one or multiple blocked dates for a marina or slip.
                  </DialogDescription>
                </div>
                <Badge className="bg-white text-navy-700 border-slate-200">
                  Step {wizardStep} of 2
                </Badge>
              </div>
            </DialogHeader>

            <form
              onSubmit={blockFormik.handleSubmit}
              className="space-y-4 p-6 bg-slate-50/40"
            >
              {wizardStep === 1 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                  <div>
                    <Label>Marina</Label>
                    <Select
                      value={blockFormik.values.marinaId}
                      onValueChange={(value) =>
                        blockFormik.setFieldValue("marinaId", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select marina" />
                      </SelectTrigger>
                      <SelectContent>
                        {marinas.map((marina) => (
                          <SelectItem key={marina.id} value={String(marina.id)}>
                            {marina.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Slip (optional)</Label>
                    <Select
                      value={blockFormik.values.slipId || "all"}
                      onValueChange={(value) =>
                        blockFormik.setFieldValue(
                          "slipId",
                          value === "all" ? "" : value,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All slips" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All slips</SelectItem>
                        {selectedMarinaSlips.map((slip) => (
                          <SelectItem key={slip.id} value={String(slip.id)}>
                            {slip.marina_name} · Slip {slip.slip_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        name="startDate"
                        value={blockFormik.values.startDate}
                        onChange={blockFormik.handleChange}
                        onBlur={blockFormik.handleBlur}
                        className="mt-1"
                      />
                      {blockFormik.touched.startDate &&
                        blockFormik.errors.startDate && (
                          <p className="text-xs text-red-600 mt-1">
                            {blockFormik.errors.startDate}
                          </p>
                        )}
                    </div>
                    <div>
                      <Label>End date</Label>
                      <Input
                        type="date"
                        name="endDate"
                        value={blockFormik.values.endDate}
                        onChange={blockFormik.handleChange}
                        onBlur={blockFormik.handleBlur}
                        className="mt-1"
                      />
                      {blockFormik.touched.endDate &&
                        blockFormik.errors.endDate && (
                          <p className="text-xs text-red-600 mt-1">
                            {blockFormik.errors.endDate}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      name="reason"
                      value={blockFormik.values.reason}
                      onChange={blockFormik.handleChange}
                      onBlur={blockFormik.handleBlur}
                      rows={3}
                      placeholder="Maintenance, private event, weather closure..."
                      className="mt-1"
                    />
                    {blockFormik.touched.reason &&
                      blockFormik.errors.reason && (
                        <p className="text-xs text-red-600 mt-1">
                          {blockFormik.errors.reason}
                        </p>
                      )}
                  </div>

                  <div>
                    <Label>Block Type</Label>
                    <Select
                      value={
                        blockFormik.values.isAllDay ? "all_day" : "interval"
                      }
                      onValueChange={(value) => {
                        const nextAllDay = value === "all_day";
                        blockFormik.setFieldValue("isAllDay", nextAllDay);
                        if (nextAllDay) {
                          blockFormik.setFieldValue("startTime", "");
                          blockFormik.setFieldValue("endTime", "");
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select block type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_day">Full day</SelectItem>
                        <SelectItem value="interval">
                          Specific time interval
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-navy-500 mt-1">
                      Choose full-day closure or a specific time interval.
                    </p>
                  </div>

                  {!blockFormik.values.isAllDay && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Start time</Label>
                        <Input
                          type="time"
                          name="startTime"
                          value={blockFormik.values.startTime}
                          onChange={blockFormik.handleChange}
                          onBlur={blockFormik.handleBlur}
                          className="mt-1"
                        />
                        {blockFormik.touched.startTime &&
                          blockFormik.errors.startTime && (
                            <p className="text-xs text-red-600 mt-1">
                              {blockFormik.errors.startTime}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label>End time</Label>
                        <Input
                          type="time"
                          name="endTime"
                          value={blockFormik.values.endTime}
                          onChange={blockFormik.handleChange}
                          onBlur={blockFormik.handleBlur}
                          className="mt-1"
                        />
                        {blockFormik.touched.endTime &&
                          blockFormik.errors.endTime && (
                            <p className="text-xs text-red-600 mt-1">
                              {blockFormik.errors.endTime}
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="pt-2">
                {wizardStep === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWizardStep(1)}
                  >
                    Back
                  </Button>
                )}

                {wizardStep === 1 ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      await blockFormik.setTouched({
                        marinaId: true,
                        startDate: true,
                        endDate: true,
                      });
                      const errors = await blockFormik.validateForm();
                      if (
                        !errors.marinaId &&
                        !errors.startDate &&
                        !errors.endDate
                      ) {
                        setWizardStep(2);
                      }
                    }}
                    className="bg-gradient-ocean"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      creatingBlock ||
                      !blockFormik.values.reason ||
                      !blockFormik.values.reason.trim()
                    }
                    className="bg-gradient-ocean"
                  >
                    {creatingBlock ? "Creating..." : "Create Block"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedBooking)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBookingId(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
            <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-navy-50 to-ocean-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl text-navy-900">
                    Booking #{selectedBooking?.id || ""} Details
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1 text-navy-600">
                    Full reservation details for this booking.
                  </DialogDescription>
                </div>
                {selectedBooking && (
                  <Badge
                    className={`capitalize border ${
                      selectedBooking.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedBooking.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : selectedBooking.status === "cancelled"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {selectedBooking.status}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {selectedBooking && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-6 bg-slate-50/40">
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Guest
                    </p>
                    <p className="font-semibold text-lg text-navy-900 mt-1">
                      {selectedBooking.guest_name}
                    </p>
                    <p className="text-navy-600 mt-1">
                      {selectedBooking.guest_email}
                    </p>
                    <p className="text-navy-600">
                      {selectedBooking.guest_phone || "No phone provided"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Boat
                    </p>
                    <p className="font-semibold text-lg text-navy-900 mt-1">
                      {selectedBooking.boat_name || "N/A"}
                    </p>
                    <p className="text-navy-600">
                      {selectedBooking.boat_type || "Type not set"}
                      {selectedBooking.boat_length
                        ? ` · ${selectedBooking.boat_length}m`
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Marina
                    </p>
                    <p className="font-semibold text-lg text-navy-900 mt-1">
                      {selectedBooking.marina_name}
                    </p>
                    <p className="text-navy-600">
                      {selectedBooking.marina_city || "City not available"}
                    </p>
                    <p className="text-navy-600">
                      {selectedBooking.slip_number
                        ? `Slip ${selectedBooking.slip_number}`
                        : "All slips"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Stay
                    </p>
                    <p className="font-semibold text-lg text-navy-900 mt-1">
                      {format(parseISO(selectedBooking.check_in_date), "PPP")} -{" "}
                      {format(parseISO(selectedBooking.check_out_date), "PPP")}
                    </p>
                    <p className="text-navy-600">
                      {selectedBooking.total_days} day
                      {selectedBooking.total_days === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Booking Status
                    </p>
                    <Badge variant="outline" className="capitalize mt-1">
                      {selectedBooking.status}
                    </Badge>
                    <p className="mt-1 text-navy-600">
                      {selectedBooking.requires_approval
                        ? selectedBooking.approved_at
                          ? `Approved ${format(parseISO(selectedBooking.approved_at), "PPP p")}`
                          : "Pending host approval"
                        : "No approval required"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Pre-checkout
                    </p>
                    <p className="text-navy-600 mt-1">
                      {selectedBooking.pre_checkout_completed
                        ? `Completed${selectedBooking.pre_checkout_completed_at ? ` on ${format(parseISO(selectedBooking.pre_checkout_completed_at), "PPP p")}` : ""}`
                        : "Not completed"}
                    </p>
                    <p className="text-navy-600">
                      {selectedBooking.completed_submissions}/
                      {selectedBooking.total_submissions} submissions completed
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-navy-500">
                      Payment
                    </p>
                    <p className="font-semibold text-2xl text-navy-900 mt-1">
                      ${Number(selectedBooking.total_amount || 0).toFixed(2)}
                    </p>
                    <p className="text-navy-600">
                      Created{" "}
                      {format(parseISO(selectedBooking.created_at), "PPP p")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="px-6 py-4 border-t bg-white">
              <Button
                variant="outline"
                onClick={() => setSelectedBookingId(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
