import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Anchor, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AvailableSlip {
  id: number;
  slipNumber: string;
  length: number;
  width: number;
  depth: number;
  pricePerDay: number;
}

interface BookingAvailability {
  bookedDates: Array<{ checkIn: string; checkOut: string }>;
  blockedDates: Array<{
    date: string;
    reason: string;
    slipId?: number;
    slipNumber?: string;
  }>;
  availableSlips: AvailableSlip[];
}

interface Props {
  marinaId: number;
  totalSlips: number;
  availability: BookingAvailability | null;
  selectedDateRange: {
    checkIn: string | null; // ISO string from Redux
    checkOut: string | null; // ISO string from Redux
  };
  selectedSlip: AvailableSlip | null;
  pricePerDay: number;
  onDateSelect: (dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  }) => void;
  onSlipSelect: (slip: AvailableSlip | null) => void;
  showSlipSelection?: boolean;
}

const BookingCalendar: React.FC<Props> = ({
  marinaId,
  totalSlips,
  availability,
  selectedDateRange,
  selectedSlip,
  pricePerDay,
  onDateSelect,
  onSlipSelect,
  showSlipSelection = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  // Convert ISO string dates from Redux to Date objects
  const checkInDate = selectedDateRange.checkIn
    ? new Date(selectedDateRange.checkIn)
    : null;
  const checkOutDate = selectedDateRange.checkOut
    ? new Date(selectedDateRange.checkOut)
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getAvailableSlipsForDate = (date: Date): number => {
    if (!availability) return 0;

    const dateStr = date.toISOString().split("T")[0];
    const baseSlipCount =
      totalSlips > 0 ? totalSlips : availability.availableSlips.length;
    let availableCount = baseSlipCount;

    let hasMarinaWideBlock = false;
    const blockedSlipIds = new Set<number>();

    // Reduce count for blocked dates
    availability.blockedDates.forEach((blocked) => {
      if (blocked.date === dateStr) {
        if (!blocked.slipId) {
          hasMarinaWideBlock = true;
          return;
        }
        blockedSlipIds.add(blocked.slipId);
      }
    });

    if (hasMarinaWideBlock) {
      return 0;
    }

    availableCount -= blockedSlipIds.size;

    // Reduce count for booked dates
    availability.bookedDates.forEach((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const dateCopy = new Date(date);
      dateCopy.setHours(0, 0, 0, 0);

      if (dateCopy >= checkIn && dateCopy < checkOut) {
        availableCount--;
      }
    });

    return Math.max(0, availableCount);
  };

  // Returns true if the date is marina-wide blocked (no slipId means the whole marina is blocked)
  const isMarinaBlockedDate = (date: Date): boolean => {
    if (!availability) return false;
    const dateStr = date.toISOString().split("T")[0];
    return availability.blockedDates.some(
      (b) => b.date === dateStr && !b.slipId,
    );
  };

  // For non-slip services: only marina-wide blocks disable a date.
  // For slip services: use the per-slip count.
  const getDateAvailabilityCount = (date: Date): number => {
    if (!showSlipSelection) {
      // Dry stack / shipyard bookings are service-level windows and should not
      // be constrained by per-slip or marina-wide slip blocks.
      return 1;
    }
    return getAvailableSlipsForDate(date);
  };

  const isDateInPast = (date: Date) => {
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy < today;
  };

  const isDateInRange = (date: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    return date >= checkInDate && date <= checkOutDate;
  };

  const isDateSelected = (date: Date) => {
    if (checkInDate && date.getTime() === checkInDate.getTime())
      return "check-in";
    if (checkOutDate && date.getTime() === checkOutDate.getTime())
      return "check-out";
    return null;
  };

  const handleDateClick = (date: Date) => {
    // Don't allow selecting past dates
    if (isDateInPast(date)) return;

    // Don't allow selecting dates with no availability
    if (getDateAvailabilityCount(date) === 0) return;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // First click or reset - set check-in
      onDateSelect({ checkIn: date, checkOut: null });
      setSelectingCheckOut(true);
    } else {
      // Second click - set check-out
      if (date > checkInDate) {
        onDateSelect({ checkIn: checkInDate, checkOut: date });
        setSelectingCheckOut(false);
      } else {
        // If clicking earlier date, reset and use as new check-in
        onDateSelect({ checkIn: date, checkOut: null });
        setSelectingCheckOut(true);
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth);

    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfWeek) / 7) * 7;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      date.setHours(0, 0, 0, 0);

      const isPast = isDateInPast(date);
      const availableSlips = getDateAvailabilityCount(date);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      const inRange = isDateInRange(date);
      const isSelected = isDateSelected(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isPast || availableSlips === 0}
          className={`
            h-14 rounded-lg transition-all duration-200 relative
            flex flex-col items-center justify-center gap-0.5
            ${isPast || availableSlips === 0 ? "cursor-not-allowed opacity-30 bg-gray-50" : "cursor-pointer hover:bg-ocean-50 hover:shadow-sm"}
            ${inRange && !isSelected ? "bg-ocean-50 text-ocean-700" : ""}
            ${isSelected === "check-in" ? "bg-navy-950 text-white font-bold shadow-md ring-2 ring-navy-950 ring-offset-1" : ""}
            ${isSelected === "check-out" ? "bg-navy-950 text-white font-bold shadow-md ring-2 ring-navy-950 ring-offset-1" : ""}
            ${isToday && !isSelected ? "ring-2 ring-navy-950" : ""}
          `}
        >
          <span
            className={`text-sm font-semibold ${isSelected ? "text-white" : isPast ? "text-gray-400" : "text-gray-900"}`}
          >
            {day}
          </span>
          {!isPast && availableSlips > 0 && !isSelected && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${availableSlips <= 2 ? "bg-amber-500" : "bg-emerald-500"}`}
              ></div>
            </div>
          )}
        </button>,
      );
    }

    // Fill remaining cells
    while (days.length < totalCells) {
      days.push(<div key={`empty-end-${days.length}`} className="h-14"></div>);
    }

    return days;
  };

  const availableSlipsForDateRange = availability?.availableSlips || [];
  const totalNights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select dates
        </h3>

        {/* Selected Date Range Display */}
        {checkInDate && checkOutDate ? (
          <div className="mb-4 p-4 bg-gradient-to-r from-ocean-50 to-emerald-50 rounded-xl border border-ocean-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="text-gray-600 text-xs mb-1">Check-in</div>
                <div className="font-semibold text-gray-900">
                  {checkInDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 text-center">
                <div className="h-px w-8 bg-gray-300"></div>
                <div className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                  {totalNights} {totalNights === 1 ? "night" : "nights"}
                </div>
                <div className="h-px w-8 bg-gray-300"></div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 text-xs mb-1">Check-out</div>
                <div className="font-semibold text-gray-900">
                  {checkOutDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Select your check-in and check-out dates
            </p>
          </div>
        )}

        {/* Calendar */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white hover:border-ocean-300 transition-colors">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-base font-bold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 p-0 hover:bg-ocean-50 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0 hover:bg-ocean-50 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
              <div
                key={idx}
                className="text-xs font-semibold text-gray-500 text-center py-2"
              >
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>

          {/* Mini Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Limited</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span>Full</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Slips Section */}
      {totalNights > 0 && showSlipSelection && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span>Choose your slip</span>
            <Badge className="ml-2 bg-ocean-100 text-ocean-700 border-ocean-200">
              {availableSlipsForDateRange.length} available
            </Badge>
          </h3>

          {availableSlipsForDateRange.length > 0 ? (
            <div className="space-y-3">
              {availableSlipsForDateRange.map((slip) => (
                <button
                  key={slip.id}
                  onClick={() =>
                    onSlipSelect(selectedSlip?.id === slip.id ? null : slip)
                  }
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                    ${
                      selectedSlip?.id === slip.id
                        ? "border-ocean-500 bg-ocean-50 shadow-md"
                        : "border-gray-200 hover:border-ocean-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-base">
                        Slip {slip.slipNumber}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {slip.length}m × {slip.width}m × {slip.depth}m depth
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ${slip.pricePerDay}
                      </p>
                      <p className="text-xs text-gray-500">per night</p>
                    </div>
                  </div>

                  {selectedSlip?.id === slip.id && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-ocean-200">
                      <div className="text-sm text-gray-700">
                        {totalNights} nights × ${slip.pricePerDay}
                      </div>
                      <div className="text-xl font-bold text-ocean-700">
                        ${(slip.pricePerDay * totalNights).toFixed(2)}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    No slips available
                  </p>
                  <p className="text-sm text-gray-600">
                    Try different dates or check our other marinas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
