"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface BookedDate {
  checkIn: string;
  checkOut: string;
}

interface BlockedDate {
  date: string;
  reason: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  slipId?: number | null; // null = entire marina blocked, number = specific slip
  slipNumber?: string;
}

interface Slip {
  id: number;
  slipNumber: string;
  length: number;
  width: number;
  depth: number;
  pricePerDay: number;
  isAvailable: boolean;
}

interface DateAvailabilityCalendarProps {
  bookedDates: BookedDate[];
  blockedDates: BlockedDate[];
  availableSlips?: Slip[];
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
  onDateSelect: (checkIn: string, checkOut: string | null) => void;
  minDate?: string;
  totalSlips?: number; // Total slips in marina (from marina.capacity.totalSlips)
  showLegend?: boolean; // Whether to show the legend
}

export default function DateAvailabilityCalendar({
  bookedDates,
  blockedDates,
  availableSlips = [],
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect,
  minDate,
  totalSlips,
  showLegend = true,
}: DateAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveringDate, setHoveringDate] = useState<string | null>(null);

  // Helper function to normalize date strings to YYYY-MM-DD format
  const normalizeDateString = (dateStr: string): string => {
    return dateStr.split("T")[0];
  };

  /**
   * Count how many slips are booked on a specific date
   */
  const getBookedSlipsCount = (date: Date): number => {
    const dateStr = date.toISOString().split("T")[0];
    return bookedDates.filter((booking) => {
      const checkIn = new Date(normalizeDateString(booking.checkIn));
      const checkOut = new Date(normalizeDateString(booking.checkOut));
      return date >= checkIn && date <= checkOut;
    }).length;
  };

  /**
   * Determines availability status for a specific date
   * A date is ONLY fully blocked if:
   * 1. There's a marina-wide block (slip_id = NULL), OR
   * 2. ALL available slips are booked/blocked for that date
   */
  const getDateAvailability = (
    date: Date
  ): {
    isFullyBlocked: boolean;
    hasPartialBlocking: boolean;
    availableSlipsCount: number;
    blockedSlipsCount: number;
    bookedSlipsCount: number;
    blockedSlips: BlockedDate[];
    reason?: string;
  } => {
    const dateStr = date.toISOString().split("T")[0];

    // Get all blocks for this specific date
    const dayBlocks = blockedDates.filter((b) => {
      const blockDateStr = normalizeDateString(b.date);
      return blockDateStr === dateStr;
    });

    // Check for marina-wide block (slip_id = NULL)
    const marinaWideBlock = dayBlocks.find((b) => b.slipId === null);
    if (marinaWideBlock) {
      return {
        isFullyBlocked: true,
        hasPartialBlocking: false,
        availableSlipsCount: 0,
        blockedSlipsCount: totalSlips || availableSlips.length,
        bookedSlipsCount: 0,
        blockedSlips: dayBlocks,
        reason: marinaWideBlock.reason,
      };
    }

    // Count booked slips for this date
    const bookedSlipsCount = getBookedSlipsCount(date);

    // If no slips data available, check if there are any blocks
    if (availableSlips.length === 0) {
      // If we have blocks but no slip data, treat it as marina-wide
      if (dayBlocks.length > 0) {
        return {
          isFullyBlocked: true,
          hasPartialBlocking: false,
          availableSlipsCount: 0,
          blockedSlipsCount: dayBlocks.length,
          bookedSlipsCount: 0,
          blockedSlips: dayBlocks,
          reason: dayBlocks[0]?.reason || "Unavailable",
        };
      }
      // No blocks and no slip data - check bookings
      const totalSlipsCount = totalSlips || 0;
      return {
        isFullyBlocked:
          bookedSlipsCount >= totalSlipsCount && totalSlipsCount > 0,
        hasPartialBlocking:
          bookedSlipsCount > 0 && bookedSlipsCount < totalSlipsCount,
        availableSlipsCount: Math.max(0, totalSlipsCount - bookedSlipsCount),
        blockedSlipsCount: 0,
        bookedSlipsCount,
        blockedSlips: [],
      };
    }

    // Calculate slip-level blocking
    const blockedSlipIds = new Set(
      dayBlocks.filter((b) => b.slipId !== null).map((b) => b.slipId)
    );

    const blockedSlipsCount = blockedSlipIds.size;
    const totalUnavailable = bookedSlipsCount + blockedSlipsCount;
    const availableSlipsCount = Math.max(
      0,
      availableSlips.length - totalUnavailable
    );

    return {
      isFullyBlocked:
        availableSlipsCount === 0 &&
        (bookedSlipsCount > 0 || blockedSlipsCount > 0),
      hasPartialBlocking:
        (blockedSlipsCount > 0 || bookedSlipsCount > 0) &&
        availableSlipsCount > 0,
      availableSlipsCount,
      blockedSlipsCount,
      bookedSlipsCount,
      blockedSlips: dayBlocks,
      reason:
        availableSlipsCount === 0 && totalUnavailable > 0
          ? dayBlocks[0]?.reason || "All slips unavailable"
          : undefined,
    };
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }

    // Date is disabled ONLY if ALL slips are unavailable (booked or blocked)
    const availability = getDateAvailability(date);
    return availability.isFullyBlocked;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const checkIn = new Date(selectedCheckIn);
    const checkOut = new Date(selectedCheckOut);
    return date >= checkIn && date <= checkOut;
  };

  const isDateInHoverRange = (date: Date): boolean => {
    if (!selectedCheckIn || selectedCheckOut || !hoveringDate) return false;
    const checkIn = new Date(selectedCheckIn);
    const hovering = new Date(hoveringDate);
    const minRange = checkIn < hovering ? checkIn : hovering;
    const maxRange = checkIn > hovering ? checkIn : hovering;
    return date >= minRange && date <= maxRange;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    const dateStr = date.toISOString().split("T")[0];

    if (!selectedCheckIn || selectedCheckOut) {
      // Start new selection
      onDateSelect(dateStr, null);
    } else {
      // Complete selection
      const checkIn = new Date(selectedCheckIn);
      if (date < checkIn) {
        // Clicked date is before check-in, swap them
        onDateSelect(dateStr, selectedCheckIn);
      } else {
        // Check if there's any booked/blocked date in between
        let hasConflict = false;
        const current = new Date(checkIn);
        current.setDate(current.getDate() + 1);

        while (current < date) {
          if (isDateDisabled(current)) {
            hasConflict = true;
            break;
          }
          current.setDate(current.getDate() + 1);
        }

        if (hasConflict) {
          // Start new selection
          onDateSelect(dateStr, null);
        } else {
          // Complete selection
          onDateSelect(selectedCheckIn, dateStr);
        }
      }
    }
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push(prevDate);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add empty cells to complete the last week
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getDayClassName = (date: Date): string => {
    const baseClass =
      "aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all relative text-sm font-medium";
    const isToday =
      date.toDateString() === new Date().toDateString()
        ? "ring-2 ring-ocean-500"
        : "";
    const isDisabled = isDateDisabled(date)
      ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
      : "";
    const isInRange = isDateInRange(date) ? "bg-ocean-100" : "";
    const isHoverRange = isDateInHoverRange(date) ? "bg-ocean-50" : "";
    const isSelected =
      selectedCheckIn === date.toISOString().split("T")[0] ||
      selectedCheckOut === date.toISOString().split("T")[0]
        ? "bg-ocean-600 text-white hover:bg-ocean-700"
        : "";
    const isNotCurrentMonth = !isCurrentMonth(date) ? "text-gray-300" : "";
    const isHoverable = !isDisabled && !isSelected ? "hover:bg-ocean-50" : "";

    return `${baseClass} ${isToday} ${isDisabled} ${isInRange} ${isHoverRange} ${isSelected} ${isNotCurrentMonth} ${isHoverable}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Legend - conditionally rendered */}
        {showLegend && (
          <div className="flex flex-wrap gap-3 text-xs mb-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-ocean-600 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-ocean-100 rounded"></div>
              <span className="text-gray-600">Range</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-100 rounded line-through"></div>
              <span className="text-gray-600">All Slips Unavailable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded relative">
                <div className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-[8px] rounded-full w-2.5 h-2.5 flex items-center justify-center font-bold">
                  #
                </div>
              </div>
              <span className="text-gray-600">Partial (# slips available)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded relative">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-gray-600">Has bookings</span>
            </div>
          </div>
        )}
      </div>{" "}
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center text-xs font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const availability = getDateAvailability(date);
          const disabled = isDateDisabled(date);

          return (
            <div
              key={index}
              className={`${getDayClassName(date)} relative group`}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveringDate(dateStr)}
              onMouseLeave={() => setHoveringDate(null)}
              title={
                availability.isFullyBlocked ? availability.reason : undefined
              }
            >
              {date.getDate()}

              {/* Booked indicator - show if there are bookings but not fully blocked */}
              {availability.bookedSlipsCount > 0 &&
                !availability.isFullyBlocked && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}

              {/* Available slips count badge (only show if partially booked/blocked and in current month) */}
              {availability.hasPartialBlocking && isCurrentMonth(date) && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                  {availability.availableSlipsCount}
                </div>
              )}

              {/* Tooltip on hover showing availability details */}
              {(availability.hasPartialBlocking ||
                availability.isFullyBlocked) &&
                isCurrentMonth(date) && (
                  <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none">
                    {availability.isFullyBlocked ? (
                      <div>
                        <div className="font-semibold text-red-300">
                          Fully Blocked
                        </div>
                        <div className="text-[10px] text-gray-300">
                          {availability.reason || "All slips unavailable"}
                        </div>
                        {availability.bookedSlipsCount > 0 && (
                          <div className="text-[10px] text-gray-300 mt-1">
                            Booked: {availability.bookedSlipsCount} slips
                          </div>
                        )}
                        {availability.blockedSlipsCount > 0 && (
                          <div className="text-[10px] text-gray-300">
                            Blocked: {availability.blockedSlipsCount} slips
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold text-green-300">
                          {availability.availableSlipsCount} of{" "}
                          {availableSlips.length ||
                            totalSlips ||
                            availability.availableSlipsCount +
                              availability.bookedSlipsCount +
                              availability.blockedSlipsCount}{" "}
                          slips available
                        </div>
                        {availability.bookedSlipsCount > 0 && (
                          <div className="text-[10px] text-gray-300 mt-1">
                            Booked: {availability.bookedSlipsCount} slips
                          </div>
                        )}
                        {availability.blockedSlipsCount > 0 && (
                          <div className="text-[10px] text-gray-300">
                            Blocked:{" "}
                            {availability.blockedSlips
                              .map((b) => b.slipNumber)
                              .filter(Boolean)
                              .join(", ") ||
                              `${availability.blockedSlipsCount} slips`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
      {/* Selected dates info */}
      {selectedCheckIn && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-semibold text-gray-900">
                {new Date(selectedCheckIn).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {selectedCheckOut && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(selectedCheckOut).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
