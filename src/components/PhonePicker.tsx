"use client";

import { useState, useMemo } from "react";

export interface PhoneCode {
  code: string;
  country: string;
  dial: string;
  flag: string;
}

const phoneCodes: PhoneCode[] = [
  { code: "US", country: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "MX", country: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "CA", country: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "GB", country: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "ES", country: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "FR", country: "France", dial: "+33", flag: "🇫🇷" },
  { code: "DE", country: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "IT", country: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "BR", country: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "AR", country: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "CL", country: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "CO", country: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "CR", country: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { code: "CU", country: "Cuba", dial: "+53", flag: "🇨🇺" },
  { code: "DO", country: "Dominican Republic", dial: "+1-809", flag: "🇩🇴" },
  { code: "EC", country: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { code: "SV", country: "El Salvador", dial: "+503", flag: "🇸🇻" },
  { code: "GT", country: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { code: "HN", country: "Honduras", dial: "+504", flag: "🇭🇳" },
  { code: "NI", country: "Nicaragua", dial: "+505", flag: "🇳🇮" },
  { code: "PA", country: "Panama", dial: "+507", flag: "🇵🇦" },
  { code: "PY", country: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { code: "PE", country: "Peru", dial: "+51", flag: "🇵🇪" },
  { code: "UY", country: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { code: "VE", country: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { code: "AU", country: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "NZ", country: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "JP", country: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "CN", country: "China", dial: "+86", flag: "🇨🇳" },
  { code: "IN", country: "India", dial: "+91", flag: "🇮🇳" },
  { code: "KR", country: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "TH", country: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "SG", country: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "MY", country: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "PH", country: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "ID", country: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "VN", country: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { code: "AE", country: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "SA", country: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "IL", country: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "TR", country: "Turkey", dial: "+90", flag: "🇹🇷" },
  { code: "RU", country: "Russia", dial: "+7", flag: "🇷🇺" },
  { code: "PL", country: "Poland", dial: "+48", flag: "🇵🇱" },
  { code: "NL", country: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "BE", country: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "CH", country: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "AT", country: "Austria", dial: "+43", flag: "🇦🇹" },
  { code: "SE", country: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "NO", country: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "DK", country: "Denmark", dial: "+45", flag: "🇩🇰" },
  { code: "FI", country: "Finland", dial: "+358", flag: "🇫🇮" },
  { code: "PT", country: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "GR", country: "Greece", dial: "+30", flag: "🇬🇷" },
  { code: "IE", country: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "ZA", country: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "EG", country: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "NG", country: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "KE", country: "Kenya", dial: "+254", flag: "🇰🇪" },
];

interface PhonePickerProps {
  value: string;
  onChange: (phoneCode: PhoneCode) => void;
  error?: string;
}

export default function PhonePicker({
  value,
  onChange,
  error,
}: PhonePickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedCode = phoneCodes.find((c) => c.dial === value);

  const filteredCodes = useMemo(() => {
    if (!search) return phoneCodes;
    const searchLower = search.toLowerCase();
    return phoneCodes.filter(
      (c) =>
        c.country.toLowerCase().includes(searchLower) ||
        c.dial.includes(search) ||
        c.code.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = (phoneCode: PhoneCode) => {
    onChange(phoneCode);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Phone Code
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white text-left flex items-center justify-between transition-all ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
        }`}
      >
        <span className="flex items-center gap-2">
          {selectedCode ? (
            <>
              <span className="text-2xl">{selectedCode.flag}</span>
              <span>{selectedCode.dial}</span>
            </>
          ) : (
            <span className="text-gray-400">Select code</span>
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

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

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
                placeholder="Search..."
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-64">
              {filteredCodes.map((phoneCode) => (
                <button
                  key={phoneCode.code + phoneCode.dial}
                  type="button"
                  onClick={() => handleSelect(phoneCode)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                    value === phoneCode.dial ? "bg-cyan-500/20" : ""
                  }`}
                >
                  <span className="text-2xl">{phoneCode.flag}</span>
                  <span className="text-white flex-1">{phoneCode.country}</span>
                  <span className="text-gray-300 font-mono">
                    {phoneCode.dial}
                  </span>
                </button>
              ))}
              {filteredCodes.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">
                  No phone codes found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
