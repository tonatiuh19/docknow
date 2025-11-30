import { Marina } from "@/store/types";
import { FaCheck } from "react-icons/fa";

interface MarinaMapCardProps {
  marina: Marina;
  isSelected?: boolean;
}

export default function MarinaMapCard({
  marina,
  isSelected = false,
}: MarinaMapCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
        isSelected ? "scale-110 ring-2 ring-cyan-500" : "hover:scale-105"
      }`}
      style={{ width: "160px" }}
    >
      {/* Image */}
      <div className="relative h-24 overflow-hidden">
        <img
          src={
            marina.image_url ||
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"
          }
          alt={marina.name}
          className="w-full h-full object-cover"
        />
        {/* Featured Badge */}
        {marina.is_featured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-1.5 rounded-full shadow-lg">
            <FaCheck className="text-xs" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600">
        <h3 className="text-white font-bold text-sm leading-tight truncate">
          {marina.name}
        </h3>
        {marina.price_per_day && marina.price_per_day > 0 && (
          <p className="text-white/90 text-xs mt-1">
            ${marina.price_per_day.toFixed(0)} / day
          </p>
        )}
      </div>

      {/* Arrow pointer */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-600"></div>
    </div>
  );
}
