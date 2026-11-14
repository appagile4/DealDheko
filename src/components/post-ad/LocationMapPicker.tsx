"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Crosshair,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  Copy,
  Check,
} from "lucide-react";

// Known coordinates fallback lookup for Nepal and India locations
const CITY_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  kathmandu: { lat: 27.7172, lng: 85.324 },
  pokhara: { lat: 28.2096, lng: 83.9856 },
  lalitpur: { lat: 27.671, lng: 85.3206 },
  bhaktapur: { lat: 27.671, lng: 85.4298 },
  "bharatpur (chitwan)": { lat: 27.6833, lng: 84.4333 },
  bharatpur: { lat: 27.6833, lng: 84.4333 },
  biratnagar: { lat: 26.4525, lng: 87.2718 },
  birgunj: { lat: 27.0104, lng: 84.8774 },
  butwal: { lat: 27.7006, lng: 83.4484 },
  dharan: { lat: 26.8124, lng: 87.2834 },
  hetauda: { lat: 27.4285, lng: 85.0322 },
  nepalgunj: { lat: 28.05, lng: 81.6167 },
  dhangadhi: { lat: 28.6833, lng: 80.6 },
  "delhi ncr": { lat: 28.6139, lng: 77.209 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  // Common areas
  thamel: { lat: 27.7154, lng: 85.3123 },
  "new road": { lat: 27.7029, lng: 85.3131 },
  baneshwor: { lat: 27.6915, lng: 85.342 },
  koteshwor: { lat: 27.6756, lng: 85.3486 },
  lakeside: { lat: 28.212, lng: 83.958 },
  patan: { lat: 27.671, lng: 85.3206 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  "bandra west": { lat: 19.0596, lng: 72.8295 },
};

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  state: string;
  city: string;
  area: string;
  pincode: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onAddressDetected?: (address: { area?: string; city?: string; state?: string }) => void;
}

export function LocationMapPicker({
  latitude,
  longitude,
  state,
  city,
  area,
  pincode,
  onCoordinatesChange,
  onAddressDetected,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Default coordinate fallback (Kathmandu center)
  const currentLat = latitude ?? 27.7172;
  const currentLng = longitude ?? 85.324;

  // Initialize Leaflet Map on Client
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        // Dynamically import Leaflet and CSS
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!isMounted || !mapContainerRef.current) return;
        leafletRef.current = L;

        // Custom DealDoko Pin SVG Icon
        const customPinIcon = L.divIcon({
          className: "dealdoko-map-marker",
          html: `
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: grab;">
              <div style="position: absolute; bottom: 2px; width: 14px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; filter: blur(1.5px);"></div>
              <div style="width: 34px; height: 34px; border-radius: 50% 50% 50% 0; background: linear-gradient(135deg, #FF6A00 0%, #E65F00 100%); transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(255,106,0,0.45); border: 2.5px solid white;">
                <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 36],
          popupAnchor: [0, -36],
        });

        // Initialize map instance if not already initialized
        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [currentLat, currentLng],
            zoom: 14,
            zoomControl: false,
          });

          // Add standard zoom control at top-right
          L.control.zoom({ position: "topright" }).addTo(map);

          // Add OpenStreetMap tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);

          // Add draggable marker
          const marker = L.marker([currentLat, currentLng], {
            icon: customPinIcon,
            draggable: true,
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; padding: 2px;">
              <strong style="color: #0047BA;">Exact Ad Location</strong><br/>
              <span style="color: #64748B;">Drag pin or click map to fine-tune</span>
            </div>
          `);

          // Update coords on marker drag
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onCoordinatesChange(
              parseFloat(pos.lat.toFixed(6)),
              parseFloat(pos.lng.toFixed(6))
            );
          });

          // Update coords on map click
          map.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            onCoordinatesChange(
              parseFloat(lat.toFixed(6)),
              parseFloat(lng.toFixed(6))
            );
          });

          mapInstanceRef.current = map;
          markerInstanceRef.current = marker;
          setIsMapReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize Leaflet map:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  // Sync external coordinates with marker & map view
  useEffect(() => {
    if (
      isMapReady &&
      mapInstanceRef.current &&
      markerInstanceRef.current &&
      latitude !== null &&
      longitude !== null
    ) {
      const currentPos = markerInstanceRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerInstanceRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
      }
    }
  }, [latitude, longitude, isMapReady]);

  // Detect location from filled address details (Nominatim + Lookup fallback)
  const detectLocationFromAddress = useCallback(
    async (showFeedback = true) => {
      if (!city && !area && !state) {
        if (showFeedback) {
          setDetectStatus("Please select a City or enter an Area first.");
          setTimeout(() => setDetectStatus(null), 3500);
        }
        return;
      }

      setIsDetecting(true);
      if (showFeedback) setDetectStatus("Locating address on map...");

      try {
        // Query OpenStreetMap Nominatim
        const addressParts = [area, city, state, pincode].filter(Boolean);
        const query = addressParts.join(", ") + ", Nepal";

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const newLat = parseFloat(parseFloat(data[0].lat).toFixed(6));
          const newLng = parseFloat(parseFloat(data[0].lon).toFixed(6));

          onCoordinatesChange(newLat, newLng);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([newLat, newLng]);
            mapInstanceRef.current.flyTo([newLat, newLng], 15, { duration: 1.2 });
          }

          if (showFeedback) {
            setDetectStatus(`Detected: ${data[0].display_name.split(",").slice(0, 2).join(",")}`);
            setTimeout(() => setDetectStatus(null), 4000);
          }
          setIsDetecting(false);
          return;
        }

        // Fallback: Check local coordinates dictionary
        const areaKey = area.trim().toLowerCase();
        const cityKey = city.trim().toLowerCase();

        const match =
          CITY_COORDINATES_MAP[areaKey] ||
          CITY_COORDINATES_MAP[cityKey] ||
          CITY_COORDINATES_MAP[cityKey.replace(/\s*\(.*\)/, "")];

        if (match) {
          onCoordinatesChange(match.lat, match.lng);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([match.lat, match.lng]);
            mapInstanceRef.current.flyTo([match.lat, match.lng], 14, { duration: 1 });
          }

          if (showFeedback) {
            setDetectStatus(`Located in ${city} via coordinates registry.`);
            setTimeout(() => setDetectStatus(null), 3500);
          }
        } else {
          if (showFeedback) {
            setDetectStatus("Address not found on geocoder; pinned at current city center.");
            setTimeout(() => setDetectStatus(null), 3500);
          }
        }
      } catch (err) {
        console.warn("Geocoding failed, using local coordinates table:", err);
        const cityKey = city.trim().toLowerCase();
        const match = CITY_COORDINATES_MAP[cityKey];
        if (match) {
          onCoordinatesChange(match.lat, match.lng);
          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([match.lat, match.lng]);
            mapInstanceRef.current.flyTo([match.lat, match.lng], 14);
          }
        }
        if (showFeedback) {
          setDetectStatus("Geocoding service busy. Pinned to city center.");
          setTimeout(() => setDetectStatus(null), 3000);
        }
      } finally {
        setIsDetecting(false);
      }
    },
    [city, area, state, pincode, onCoordinatesChange]
  );

  // Auto-detect GPS location via browser Geolocation API
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setDetectStatus("Geolocation is not supported by your browser.");
      setTimeout(() => setDetectStatus(null), 3500);
      return;
    }

    setIsDetecting(true);
    setDetectStatus("Acquiring GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        onCoordinatesChange(lat, lng);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        }

        // Reverse geocode to suggest area/city
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const revData = await revRes.json();
          if (revData && revData.address && onAddressDetected) {
            onAddressDetected({
              area: revData.address.suburb || revData.address.neighbourhood || revData.address.road || "",
              city: revData.address.city || revData.address.town || revData.address.county || "",
              state: revData.address.state || "",
            });
          }
        } catch {
          // Ignore reverse geocode failures
        }

        setDetectStatus("GPS location acquired successfully!");
        setTimeout(() => setDetectStatus(null), 3500);
        setIsDetecting(false);
      },
      (err) => {
        setDetectStatus("GPS permission denied or unavailable. Please pick location manually.");
        setTimeout(() => setDetectStatus(null), 4000);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Copy coordinates to clipboard
  const handleCopyCoords = () => {
    if (latitude && longitude) {
      navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-200">
      {/* Header and Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-[#FF6A00]" />
            <span>Map Location &amp; Coordinates</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0047BA] border border-blue-200">
              Exact Pinpoint
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click map or drag the pin marker to specify the exact pickup / shop location
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => detectLocationFromAddress(true)}
            disabled={isDetecting || (!city && !area)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0047BA] border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Automatically locate on map using your filled City & Area"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Detect from Address</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={isDetecting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6A00] border border-orange-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Use your phone or computer GPS location"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Use My GPS</span>
          </button>
        </div>
      </div>

      {/* Detection Status Message */}
      {detectStatus && (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2 animate-in fade-in">
          <Navigation className="w-3.5 h-3.5 text-[#0047BA] shrink-0 animate-pulse" />
          <span className="font-medium">{detectStatus}</span>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-300 shadow-xs bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Overlay Helper Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none bg-white/90 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Interactive Pin: Click anywhere or drag marker</span>
        </div>
      </div>

      {/* Latitude & Longitude Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
        {/* Latitude Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Latitude (Exact Y Coordinate)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              step="any"
              placeholder="e.g. 27.717200"
              value={latitude !== null ? latitude : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onCoordinatesChange(isNaN(val) ? 0 : val, longitude ?? 85.324);
              }}
              className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0047BA] focus:ring-1 focus:ring-[#0047BA]"
            />
            <span className="absolute right-2.5 text-[10px] text-slate-400 font-bold uppercase pointer-events-none">
              °N
            </span>
          </div>
        </div>

        {/* Longitude Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Longitude (Exact X Coordinate)
            </label>
            {latitude && longitude && (
              <button
                type="button"
                onClick={handleCopyCoords}
                className="text-[10px] text-slate-500 hover:text-[#0047BA] font-semibold flex items-center gap-1 cursor-pointer"
                title="Copy coordinates"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              step="any"
              placeholder="e.g. 85.324000"
              value={longitude !== null ? longitude : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onCoordinatesChange(latitude ?? 27.7172, isNaN(val) ? 0 : val);
              }}
              className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0047BA] focus:ring-1 focus:ring-[#0047BA]"
            />
            <span className="absolute right-2.5 text-[10px] text-slate-400 font-bold uppercase pointer-events-none">
              °E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
