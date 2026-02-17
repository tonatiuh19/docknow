import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface InternationalPhoneInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
  error?: string;
}

const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  className,
  defaultCountry = "US",
  error,
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <PhoneInput
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry as any}
        placeholder={placeholder}
        disabled={disabled}
        international
        countryCallingCodeEditable={false}
        className={cn(
          "flex h-12 w-full rounded-md border bg-background text-sm ring-offset-background",
          error ? "border-red-300" : "border-input",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
        )}
        numberInputProps={{
          className: cn(
            "flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          ),
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { InternationalPhoneInput };
