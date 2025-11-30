"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createRoot } from "react-dom/client";
import MarinaMapCard from "./marina/MarinaMapCard";

import { Marina } from "@/store/types";

interface MarinaMapProps {
  marinas: Marina[];
  onMarkerClick?: (marina: Marina) => void;
  selectedMarinaId?: number;
  height?: string;
}

export default function MarinaMap({
  marinas,
  onMarkerClick,
  selectedMarinaId,
  height = "600px",
}: MarinaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      // Default center: Mexico
      const map = L.map(mapContainerRef.current).setView(
        [23.6345, -102.5528],
        5
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || marinas.length === 0) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Create bounds for fitting all markers
    const bounds = L.latLngBounds([]);

    // Add markers for each marina
    marinas.forEach((marina) => {
      // Skip if no coordinates
      if (!marina.coordinates) return;

      const { lat, lng } = marina.coordinates;

      // Create a container for the React component
      const markerElement = document.createElement("div");
      const root = createRoot(markerElement);

      // Render the MarinaMapCard component
      root.render(
        <MarinaMapCard
          marina={marina}
          isSelected={selectedMarinaId === marina.id}
        />
      );

      // Create custom divIcon
      const customIcon = L.divIcon({
        html: markerElement,
        className: "marina-marker-wrapper",
        iconSize: [160, 120],
        iconAnchor: [80, 122],
        popupAnchor: [0, -122],
      });

      // Create marker
      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create popup content with enhanced styling
      const popupContent = `
        <div class="marina-popup-modern">
          <div class="popup-image-wrapper">
            <img src="${
              marina.image_url ||
              "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600"
            }" 
                 alt="${marina.name}" 
                 class="popup-image" />
            ${
              marina.is_featured
                ? '<div class="popup-featured-badge">⭐ Featured</div>'
                : ""
            }
          </div>
          <div class="popup-content-modern">
            <h3 class="popup-title">${marina.name}</h3>
            <p class="popup-location">📍 ${marina.location}</p>
            ${
              marina.price_per_day && marina.price_per_day > 0
                ? `
              <div class="popup-price-tag">
                <span class="price-amount">$${marina.price_per_day.toFixed(
                  2
                )}</span>
                <span class="price-period">per day</span>
              </div>
            `
                : ""
            }
            ${
              marina.description
                ? `<p class="popup-description">${marina.description.substring(
                    0,
                    100
                  )}${marina.description.length > 100 ? "..." : ""}</p>`
                : ""
            }
            <button class="popup-book-btn" onclick="window.location.href='/marinas/${
              marina.slug
            }'">
              View Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: "marina-popup-wrapper-modern",
      });

      // Handle marker click
      marker.on("click", () => {
        if (onMarkerClick) {
          onMarkerClick(marina);
        }
      });

      // Add to map
      marker.addTo(map);
      markersRef.current.set(marina.id, marker);
      bounds.extend([lat, lng]);
    });

    // Fit map to show all markers
    if (marinas.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [marinas, selectedMarinaId, onMarkerClick]);

  // Highlight selected marker
  useEffect(() => {
    if (!selectedMarinaId) return;

    const marker = markersRef.current.get(selectedMarinaId);
    if (marker && mapRef.current) {
      mapRef.current.setView(marker.getLatLng(), 13, { animate: true });
      marker.openPopup();
    }
  }, [selectedMarinaId]);

  return (
    <>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height }}
        className="marina-map rounded-xl overflow-hidden shadow-lg"
      />

      <style jsx global>{`
        .marina-marker-wrapper {
          background: transparent;
          border: none;
        }

        /* Modern Popup Styles */
        .marina-popup-wrapper-modern .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .marina-popup-wrapper-modern .leaflet-popup-content {
          margin: 0;
          width: 320px !important;
        }

        .marina-popup-modern {
          display: flex;
          flex-direction: column;
        }

        .popup-image-wrapper {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
        }

        .popup-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .popup-featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          font-weight: bold;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .popup-content-modern {
          padding: 20px;
          background: white;
        }

        .popup-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: bold;
          color: #1a202c;
        }

        .popup-location {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #64748b;
        }

        .popup-price-tag {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          background: linear-gradient(135deg, #06b6d4, #0284c7);
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          font-weight: bold;
        }

        .price-amount {
          font-size: 24px;
        }

        .price-period {
          font-size: 12px;
          opacity: 0.9;
        }

        .popup-description {
          margin: 12px 0;
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
        }

        .popup-book-btn {
          width: 100%;
          background: linear-gradient(135deg, #06b6d4, #0284c7);
          color: white;
          font-weight: bold;
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
          margin-top: 16px;
          transition: all 0.3s ease;
        }

        .popup-book-btn:hover {
          background: linear-gradient(135deg, #0891b2, #0369a1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
        }

        /* Leaflet popup arrow */
        .marina-popup-wrapper-modern .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </>
  );
}
