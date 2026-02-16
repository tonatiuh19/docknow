import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ChevronDown } from "lucide-react";
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
    <div className="space-y-1">
      <div className={cn("relative", className)}>
        <style jsx>{`
          .international-phone-input :global(.PhoneInput) {
            --PhoneInput-color--focus: hsl(var(--ring));
            --PhoneInputCountryFlag-aspectRatio: 1.333;
            --PhoneInputCountryFlag-height: 1em;
            --PhoneInputCountrySelectArrow-color: hsl(var(--muted-foreground));
            display: flex;
            position: relative;
          }

          .international-phone-input :global(.PhoneInputCountry) {
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 8px;
            border-right: 1px solid hsl(var(--border));
            background: hsl(var(--background));
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 6px 0 0 6px;
          }

          .international-phone-input :global(.PhoneInputCountry:hover) {
            background: hsl(var(--accent));
          }

          .international-phone-input :global(.PhoneInputCountryFlag) {
            width: 24px;
            height: 18px;
            margin-right: 8px;
            border-radius: 2px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          }

          .international-phone-input :global(.PhoneInputCountrySelect) {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 1;
            border: none;
            opacity: 0;
            cursor: pointer;
          }

          .international-phone-input :global(.PhoneInputCountrySelectArrow) {
            display: block;
            width: 16px;
            height: 16px;
            color: hsl(var(--muted-foreground));
            pointer-events: none;
          }

          .international-phone-input :global(.PhoneInputInput) {
            flex: 1;
            border: 1px solid
              ${error ? "hsl(var(--destructive))" : "hsl(var(--border))"};
            border-left: none;
            border-radius: 0 6px 6px 0;
            height: 48px;
            padding: 0 12px;
            font-size: 14px;
            background: hsl(var(--background));
            color: hsl(var(--foreground));
            outline: none;
            transition: all 0.2s ease;
          }

          .international-phone-input :global(.PhoneInputInput:focus) {
            border-color: hsl(var(--ring));
            box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
          }

          .international-phone-input :global(.PhoneInputInput::placeholder) {
            color: hsl(var(--muted-foreground));
          }
        `}</style>

        <div className="international-phone-input">
          <PhoneInput
            value={value}
            onChange={onChange}
            defaultCountry={defaultCountry as any}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("w-full")}
            countrySelectComponent={({
              className: selectClassName,
              ...selectProps
            }) => (
              <div className="relative flex items-center">
                <select {...selectProps} className="PhoneInputCountrySelect" />
                <ChevronDown className="PhoneInputCountrySelectArrow" />
              </div>
            )}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { InternationalPhoneInput };
