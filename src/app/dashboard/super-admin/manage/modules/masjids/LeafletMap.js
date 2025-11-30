// src/app/dashboard/super-admin/manage/modules/masjids/LeafletMap.js

"use client";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useState, useRef } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default function LeafletMap({ lat, lng, onSelect, onClose }) {
  const [position, setPosition] = useState(
    lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
  );
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  // 🔥 Search trigger reference
  const runSearchRef = useRef(() => {});

  function SearchLogic() {
    const map = useMap();

    // link the search function to ref so form can call it
    runSearchRef.current = async () => {
      if (!search.trim()) return;
      setSearching(true);

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          search
        )}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.length > 0) {
          const found = data[0];
          map.setView(
            { lat: parseFloat(found.lat), lng: parseFloat(found.lon) },
            16
          );
        }
      } finally {
        setSearching(false);
      }
    };

    return null;
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onSelect(e.latlng.lat, e.latlng.lng);
        onClose();
      },
    });

    return position ? <Marker position={position} /> : null;
  }

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {/* 🔵 Search bar above map */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearchRef.current(); // 🔥 triggers search INSIDE map context
        }}
        className="flex gap-2 mb-3 w-full"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Masjid / Area / City"
          className="flex-1 px-3 py-2 rounded border"
        />
        <button
          disabled={searching}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          type="submit"
        >
          {searching ? "..." : "Search"}
        </button>
      </form>

      {/* 🔵 Map below search */}
      <div className="flex-1 rounded overflow-hidden">
        <MapContainer
          center={position || { lat: 12.2958, lng: 76.6394 }}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
          <SearchLogic /> {/* 🔥 connects useMap() to the search bar */}
        </MapContainer>
      </div>
    </div>
  );
}
