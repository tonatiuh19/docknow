import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DateOfBirthInputProps {
  value?: string;
  onChange?: (date: string) => void;
  error?: string;
  className?: string;
}

const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  value,
  onChange,
  error,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Format date as MM/DD/YYYY for display
  const formatDisplayDate = (isoDate: string): string => {
    if (!isoDate) return "";
    try {
      // Handle both YYYY-MM-DD and other date formats
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return "";

      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.error("Error formatting display date:", error, isoDate);
      return "";
    }
  };

  // Parse MM/DD/YYYY format to ISO date string
  const parseDisplayDate = (displayDate: string): string => {
    if (!displayDate) return "";
    const parts = displayDate.replace(/\D/g, "");
    if (parts.length !== 8) return "";

    const month = parts.substring(0, 2);
    const day = parts.substring(2, 4);
    const year = parts.substring(4, 8);

    // Validate ranges
    if (parseInt(month) < 1 || parseInt(month) > 12) return "";
    if (parseInt(day) < 1 || parseInt(day) > 31) return "";
    if (parseInt(year) < 1900) return "";

    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ""); // Remove non-digits

    // Limit to 8 digits (MMDDYYYY)
    if (inputValue.length > 8) {
      inputValue = inputValue.substring(0, 8);
    }

    // Format as MM/DD/YYYY
    let formatted = "";
    if (inputValue.length >= 1) {
      formatted += inputValue.substring(0, 2);
      if (inputValue.length >= 3) {
        formatted += "/" + inputValue.substring(2, 4);
        if (inputValue.length >= 5) {
          formatted += "/" + inputValue.substring(4, 8);
        }
      }
    }

    setDisplayValue(formatted);

    // If we have a complete date, convert to ISO and call onChange
    if (inputValue.length === 8) {
      const isoDate = parseDisplayDate(formatted);
      if (isoDate) {
        onChange?.(isoDate);
      }
    }
  };

  const handleBlur = () => {
    // Format the existing value on blur if we have one
    if (value && !displayValue) {
      setDisplayValue(formatDisplayDate(value));
    }
  };

  // Initialize display value when component receives a new value prop
  React.useEffect(() => {
    if (value) {
      const formattedDate = formatDisplayDate(value);
      setDisplayValue(formattedDate);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  // Calculate maximum date (18 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split("T")[0];

  // Calculate minimum date (reasonable maximum age of 120)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="MM/DD/YYYY"
        maxLength={10}
        className={`pr-10 ${className}`}
      />
      <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { DateOfBirthInput };
