// src/components/masjid/MasjidSelector.js

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
    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
      <Select
        label="City"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        options={cities.map((c) => ({ label: c.name, value: c._id }))}
        placeholder="Select City"
      />

      <Select
        label="Area"
        value={selectedArea}
        onChange={(e) => setSelectedArea(e.target.value)}
        options={areas.map((a) => ({ label: a.name, value: a._id }))}
        disabled={!areas.length}
        placeholder="Select Area"
      />

      <Select
        label="Masjid"
        value={localMasjidId}
        onChange={handleMasjidChange}
        options={masjids.map((m) => ({ label: m.name, value: m._id }))}
        disabled={!masjids.length}
        placeholder="Select Masjid"
      />
    </div>
  );
}
