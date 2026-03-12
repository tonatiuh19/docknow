import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Anchor } from "lucide-react";
import { Marina } from "@shared/api";
import "leaflet/dist/leaflet.css";

interface MarinaMapProps {
  marinas: Marina[];
  userLocation?: [number, number] | null;
}

const generatePopupHTML = (marina: Marina): string => {
  const rating = marina.avg_rating ? marina.avg_rating.toFixed(1) : "4.5";
  const price = marina.price_per_day ?? "—";
  const isBookable = !marina.is_directory_only;
  const location = [marina.city, marina.state || marina.country]
    .filter(Boolean)
    .join(", ");

  const imgHTML = marina.primary_image_url
    ? `<img src="${marina.primary_image_url}" alt="${marina.name}" style="width:100%;height:100%;object-fit:cover;display:block" />`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#0c4a6e,#0369a1);display:flex;align-items:center;justify-content:center">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 3v1M12 3a5 5 0 0 1 5 5c0 4.5-5 11-5 11S7 12.5 7 8a5 5 0 0 1 5-5z"/><circle cx="12" cy="8" r="2"/></svg>
      </div>`;

  return `
    <div style="width:236px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <!-- image -->
      <div style="margin:-13px -19px 0;height:130px;overflow:hidden;border-radius:8px 8px 0 0;position:relative">
        ${imgHTML}
        ${
          isBookable
            ? `<!-- price badge -->
        <div style="position:absolute;top:10px;right:10px;background:rgba(2,6,23,0.72);backdrop-filter:blur(8px);color:#fff;font-size:12px;font-weight:700;padding:4px 9px;border-radius:20px;border:1px solid rgba(255,255,255,0.15)">
          $${price}<span style="font-weight:400;opacity:0.7">/day</span>
        </div>`
            : ""
        }
      </div>
      <!-- content -->
      <div style="padding-top:14px">
        <div style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.3;margin-bottom:5px">${marina.name}</div>
        <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:#64748b;margin-bottom:12px">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="#94a3b8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
          ${location}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:5px">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#f97316"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span style="font-size:13px;font-weight:600;color:#0f172a">${rating}</span>
            <span style="font-size:12px;color:#94a3b8">rating</span>
          </div>
          <div style="font-size:12px;color:#64748b">${isBookable ? "Slip available" : "Directory listing"}</div>
        </div>
        <a href="/discover/${marina.slug}" style="display:block;background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;text-align:center;padding:10px 0;border-radius:9px;font-size:13px;font-weight:600;letter-spacing:0.01em;text-decoration:none;transition:opacity 0.15s">
          Explore Marina &rarr;
        </a>
      </div>
    </div>
  `;
};

const MarinaMap: React.FC<MarinaMapProps> = ({ marinas, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const getMapCenter = (): [number, number] => {
    if (marinas.length === 0) return [20.0, -100.0]; // Default to Gulf of Mexico

    const marinasWithCoords = marinas.filter((m) => m.latitude && m.longitude);
    if (marinasWithCoords.length === 0) return [20.0, -100.0];

    const avgLat =
      marinasWithCoords.reduce(
        (sum, marina) => sum + (marina.latitude || 0),
        0,
      ) / marinasWithCoords.length;
    const avgLng =
      marinasWithCoords.reduce(
        (sum, marina) => sum + (marina.longitude || 0),
        0,
      ) / marinasWithCoords.length;

    return [avgLat || 20.0, avgLng || -100.0];
  };

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = await import("leaflet");

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
        });

        if (!isMounted) return;

        // Initialize map
        const center = userLocation ?? getMapCenter();
        const zoom = userLocation ? 10 : 6;
        const map = L.map(mapRef.current).setView(center, zoom);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Custom marina marker icon
        const marinaIcon = new L.Icon({
          iconUrl:
            "data:image/svg+xml;base64," +
            btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0369a1" width="32" height="32">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              <circle cx="12" cy="9" r="1.5" fill="white"/>
            </svg>
          `),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        // Add user location marker if available
        if (userLocation) {
          const userIcon = new L.Icon({
            iconUrl:
              "data:image/svg+xml;base64," +
              btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                <circle cx="12" cy="12" r="10" fill="#0ea5e9" fill-opacity="0.25" stroke="#0ea5e9" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="5" fill="#0ea5e9"/>
                <circle cx="12" cy="12" r="2.5" fill="white"/>
              </svg>
            `),
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          L.marker(userLocation, { icon: userIcon })
            .bindPopup("<strong>You are here</strong>")
            .addTo(map);
        }

        // Add markers for marinas with coordinates
        const newMarkers: any[] = [];
        marinas
          .filter((marina) => marina.latitude && marina.longitude)
          .forEach((marina) => {
            const marker = L.marker([marina.latitude!, marina.longitude!], {
              icon: marinaIcon,
            })
              .addTo(map)
              .bindPopup(generatePopupHTML(marina), { maxWidth: 274 });

            newMarkers.push(marker);
          });

        if (isMounted) {
          mapInstanceRef.current = map;
          markersRef.current = newMarkers;
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // Cleanup map and markers
      if (mapInstanceRef.current) {
        markersRef.current.forEach((marker) => {
          if (marker && marker.remove) {
            marker.remove();
          }
        });
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [marinas]);

  // Update markers when marinas change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      try {
        const L = await import("leaflet");

        // Clear existing markers
        markersRef.current.forEach((marker) => {
          if (marker && marker.remove) {
            marker.remove();
          }
        });
        markersRef.current = [];

        // Custom marina marker icon
        const marinaIcon = new L.Icon({
          iconUrl:
            "data:image/svg+xml;base64," +
            btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0369a1" width="32" height="32">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              <circle cx="12" cy="9" r="1.5" fill="white"/>
            </svg>
          `),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        // Add new markers
        const newMarkers: any[] = [];
        marinas
          .filter((marina) => marina.latitude && marina.longitude)
          .forEach((marina) => {
            const marker = L.marker([marina.latitude!, marina.longitude!], {
              icon: marinaIcon,
            })
              .addTo(mapInstanceRef.current)
              .bindPopup(generatePopupHTML(marina), { maxWidth: 274 });

            newMarkers.push(marker);
          });

        markersRef.current = newMarkers;

        // Update map center if we have marinas (only if user location not set)
        if (marinas.length > 0 && !userLocation) {
          const center = getMapCenter();
          mapInstanceRef.current.setView(center, 6);
        }
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };

    updateMarkers();
  }, [marinas]);

  // Fly to user location when it becomes available after map init
  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(userLocation, 10, { duration: 1.2 });
  }, [userLocation]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full"
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
    />
  );
};

export default MarinaMap;
