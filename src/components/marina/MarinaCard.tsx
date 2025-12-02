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
      className="backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden group hover:-translate-y-1"
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
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {marina.is_featured && (
            <div className="absolute top-4 left-4 backdrop-blur-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-amber-500/30 border border-white/30">
              <FaAward className="w-4 h-4" /> Featured Marina
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300">
                {marina.name}
              </h2>
              <p className="text-slate-600 flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <FaMapMarkerAlt className="text-white w-3 h-3" />
                </div>
                {marina.location}
              </p>
            </div>
            {marina.price_per_day && marina.price_per_day > 0 && (
              <div className="ml-4 text-right p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-100">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  ${marina.price_per_day.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600 font-semibold">
                  per day
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {marina.description && (
            <p className="text-slate-600 mb-5 line-clamp-2 text-base leading-relaxed">
              {marina.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
            {marina.contact_email && (
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <MdSecurity className="text-white w-3 h-3" />
                </div>
                {marina.contact_email}
              </span>
            )}
            {marina.contact_phone && (
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <FaShip className="text-white w-3 h-3" />
                </div>
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
              className="relative px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-white/10 transition-opacity"></div>
              <span className="relative z-10">Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
