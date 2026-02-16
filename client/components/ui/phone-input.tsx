import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
}

const CustomPhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  className,
  defaultCountry = "US",
}) => {
  return (
    <div className={cn("phone-input-wrapper", className)}>
      <style>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
        }
        
        .phone-input-wrapper .PhoneInputCountry {
          margin-right: 8px;
          display: flex;
          align-items: center;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .phone-input-wrapper .PhoneInputCountry:hover {
          background-color: hsl(var(--accent));
        }
        
        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }
        
        .phone-input-wrapper .PhoneInputCountryIcon--border {
          box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
        }
        
        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          width: 0.3em;
          height: 0.3em;
          margin-left: 6px;
          border-style: solid;
          border-color: hsl(var(--foreground));
          border-top-width: 0;
          border-bottom-width: 1px;
          border-left-width: 0;
          border-right-width: 1px;
          transform: rotate(45deg);
          opacity: 0.6;
        }
        
        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          height: 48px;
          width: 100%;
          border-radius: 6px;
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--background));
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .phone-input-wrapper .PhoneInputInput:focus {
          outline: none;
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }
        
        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: hsl(var(--muted-foreground));
        }
        
        .phone-input-wrapper .PhoneInputInput:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <PhoneInput
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry as any}
        placeholder={placeholder}
        disabled={disabled}
        international
        countryCallingCodeEditable={false}
      />
    </div>
  );
};

export { CustomPhoneInput };
