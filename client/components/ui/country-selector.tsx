import React from "react";
import { Check, ChevronDown } from "lucide-react";
import Flag from "react-country-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  code: string;
  name: string;
  flag: string;
}

// Popular countries list
const countries: Country[] = [
  { code: "US", name: "United States", flag: "US" },
  { code: "CA", name: "Canada", flag: "CA" },
  { code: "MX", name: "Mexico", flag: "MX" },
  { code: "GB", name: "United Kingdom", flag: "GB" },
  { code: "FR", name: "France", flag: "FR" },
  { code: "DE", name: "Germany", flag: "DE" },
  { code: "ES", name: "Spain", flag: "ES" },
  { code: "IT", name: "Italy", flag: "IT" },
  { code: "NL", name: "Netherlands", flag: "NL" },
  { code: "AU", name: "Australia", flag: "AU" },
  { code: "JP", name: "Japan", flag: "JP" },
  { code: "BR", name: "Brazil", flag: "BR" },
  { code: "IN", name: "India", flag: "IN" },
  { code: "CN", name: "China", flag: "CN" },
  { code: "RU", name: "Russia", flag: "RU" },
  { code: "ZA", name: "South Africa", flag: "ZA" },
  { code: "AR", name: "Argentina", flag: "AR" },
  { code: "CL", name: "Chile", flag: "CL" },
  { code: "CO", name: "Colombia", flag: "CO" },
  { code: "KR", name: "South Korea", flag: "KR" },
];

interface CountrySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select country...",
  className,
}) => {
  const selectedCountry = countries.find((country) => country.code === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-full h-12 ${className}`}>
        <SelectValue placeholder={placeholder}>
          {selectedCountry && (
            <div className="flex items-center">
              <Flag
                countryCode={selectedCountry.flag}
                svg
                style={{
                  width: "20px",
                  height: "15px",
                  marginRight: "8px",
                }}
              />
              {selectedCountry.name}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center">
              <Flag
                countryCode={country.flag}
                svg
                style={{
                  width: "20px",
                  height: "15px",
                  marginRight: "8px",
                }}
              />
              {country.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { CountrySelector };
export { countries };
