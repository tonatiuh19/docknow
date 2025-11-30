import { LuShipWheel } from "react-icons/lu";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
}

export default function LoadingSpinner({
  size = "md",
  message = "Loading marinas...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Outer rotating ring with wave effect */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-ocean-200 border-t-ocean-600 border-r-ocean-500 animate-spin`}
          style={{ animationDuration: "1.5s" }}
        ></div>

        {/* Middle ring rotating opposite direction */}
        <div
          className={`absolute inset-2 rounded-full border-2 border-ocean-300 border-b-ocean-400 opacity-50`}
          style={{
            animation: "spin 2s linear infinite reverse",
          }}
        ></div>

        {/* Ship wheel icon - rotating gear effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <LuShipWheel
            className={`text-ocean-600 ${
              size === "sm"
                ? "h-5 w-5"
                : size === "md"
                ? "h-10 w-10"
                : size === "lg"
                ? "h-16 w-16"
                : "h-20 w-20"
            }`}
            style={{
              animation: "spin 3s linear infinite",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
            }}
          />
        </div>

        {/* Inner pulsing dot for depth */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        >
          <div className="h-2 w-2 bg-ocean-600 rounded-full"></div>
        </div>
      </div>

      {message && (
        <p className="mt-6 text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
