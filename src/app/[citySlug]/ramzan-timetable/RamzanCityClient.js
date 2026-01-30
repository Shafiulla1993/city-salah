// src/app/[citySlug]/ramzan-timetable/RamzanCityClient.js

"use client";

import { useEffect, useState } from "react";
import RamzanCards from "@/components/ramzan/RamzanCards";

function addMin(min, add) {
  return (min + add + 1440) % 1440;
}

export default function RamzanCityClient({ citySlug }) {
  const [coords, setCoords] = useState(null);
  const [days, setDays] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (!coords) return;

    fetch(
      `/api/public/prayer-timings/by-coords?lat=${coords.lat}&lng=${coords.lng}`,
    )
      .then((r) => r.json())
      .then((d) => {
        const map = Object.fromEntries(d.slots.map((s) => [s.name, s.time]));

        const sehri = map.sehri_end;
        const iftar = addMin(map.maghrib_start, 2);

        setDays([
          {
            date: new Date().toISOString().slice(0, 10),
            sehri,
            iftar,
          },
        ]);
      });
  }, [coords]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">
        Ramzan Sehri & Iftar – {citySlug.replace(/-/g, " ")}
      </h1>
      <RamzanCards days={days} />
    </div>
  );
}
