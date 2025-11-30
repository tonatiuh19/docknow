import Link from "next/link";
import { FaMapMarkerAlt, FaStar, FaAward } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { FaShip } from "react-icons/fa";
import { Marina } from "@/store/types";

interface MarinaCardProps {
  marina: Marina;
}

export default function MarinaCard({ marina }: MarinaCardProps) {
  return (
    <Link
      href={`/marinas/${marina.slug}`}
      className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]"
    >
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-96 h-64 md:h-auto relative overflow-hidden">
          <img
            src={
              marina.image_url ||
              "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
            }
            alt={marina.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {marina.is_featured && (
            <div className="absolute top-4 left-4 backdrop-blur-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
              <FaAward /> Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-ocean-600 transition-colors">
                {marina.name}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <FaMapMarkerAlt className="text-ocean-600" />
                {marina.location}
              </p>
            </div>
            {marina.price_per_day && marina.price_per_day > 0 && (
              <div className="ml-4 text-right">
                <div className="text-3xl font-bold text-ocean-600">
                  ${marina.price_per_day.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">per day</div>
              </div>
            )}
          </div>

          {/* Description */}
          {marina.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {marina.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            {marina.contact_email && (
              <span className="flex items-center gap-1.5">
                <MdSecurity className="text-ocean-600" />
                {marina.contact_email}
              </span>
            )}
            {marina.contact_phone && (
              <span className="flex items-center gap-1.5">
                <FaShip className="text-ocean-600" />
                {marina.contact_phone}
              </span>
            )}
          </div>

          {/* Book Now Button */}
          <div className="flex gap-3 items-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                // Navigation will be handled by the Link wrapper
              }}
              className="relative px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
