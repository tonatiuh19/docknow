"use client";

import { useState, useMemo } from "react";
import { MdLocationOn } from "react-icons/md";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
];

interface CountryPickerProps {
  value: string;
  onChange: (country: Country) => void;
  error?: string;
}

export default function CountryPicker({
  value,
  onChange,
  error,
}: CountryPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry = countries.find((c) => c.code === value);

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const searchLower = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.code.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
        <MdLocationOn className="w-4 h-4 text-cyan-400" />
        Country
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 bg-gray-700/50 border rounded-xl text-white text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
            : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500/50"
        }`}
      >
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Select a country</span>
          )}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-hidden">
            <div className="p-3 border-b border-gray-700 sticky top-0 bg-gray-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-64">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                    value === country.code ? "bg-cyan-500/20" : ""
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-white">{country.name}</span>
                  <span className="text-gray-400 text-sm ml-auto">
                    {country.code}
                  </span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">
                  No countries found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
