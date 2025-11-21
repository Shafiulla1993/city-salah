"use client";
import React, { useEffect, useState } from "react";
import { Select } from "@/components/form/Select";

export default function MasjidSelector({
  cities,
  areas,
  masjids,
  selectedCity,
  selectedArea,
  selectedMasjid,
  setSelectedCity,
  setSelectedArea,
  setSelectedMasjid,
}) {
  const [localMasjidId, setLocalMasjidId] = useState(selectedMasjid?._id || "");

  useEffect(() => {
    setLocalMasjidId(selectedMasjid?._id || "");
  }, [selectedMasjid]);

  const handleMasjidChange = (e) => {
    const masjid = masjids.find((m) => m._id === e.target.value);
    setSelectedMasjid(masjid || null);
  };

  return (
    <div className="flex gap-2">
      {/* City Selector */}
      <Select
        label="City"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        options={cities}
        placeholder="Select City"
      />

      {/* Area Selector */}
      <Select
        label="Area"
        value={selectedArea}
        onChange={(e) => setSelectedArea(e.target.value)}
        options={areas}
        disabled={!areas.length}
        placeholder="Select Area"
      />

      {/* Masjid Selector */}
      <Select
        label="Masjid"
        value={localMasjidId}
        onChange={handleMasjidChange}
        options={masjids}
        disabled={!masjids.length}
        placeholder="Select Masjid"
      />
    </div>
  );
}
