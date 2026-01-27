// src/app/[citySlug]/[areaSlug]/ramzan-timetable/RamzanClient.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RamzanCards from "@/components/ramzan/RamzanCards";

export default function RamzanClient({ citySlug, areaSlug }) {
  const router = useRouter();

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState(citySlug);
  const [selectedArea, setSelectedArea] = useState(areaSlug);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/cities")
      .then((r) => r.json())
      .then(setCities);
  }, []);

  useEffect(() => {
    const city = cities.find((c) => c.slug === selectedCity);
    if (!city) return;

    fetch(`/api/public/areas?cityId=${city._id}`)
      .then((r) => r.json())
      .then(setAreas);
  }, [cities, selectedCity]);

  useEffect(() => {
    setSelectedCity(citySlug);
    setSelectedArea(areaSlug);
  }, [citySlug, areaSlug]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const qs = new URLSearchParams({
        citySlug: selectedCity,
        areaSlug: selectedArea,
      }).toString();

      const res = await fetch(`/api/public/ramzan-timetable?${qs}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setDays(json?.days || []);
      setLoading(false);
    }

    if (selectedCity && selectedArea) load();
  }, [selectedCity, selectedArea]);

  const onCityChange = async (slug) => {
    const city = cities.find((c) => c.slug === slug);
    if (!city) return;
    const res = await fetch(`/api/public/areas?cityId=${city._id}`);
    const list = await res.json();
    if (!list.length) return;
    router.push(`/${slug}/${list[0].slug}/ramzan-timetable`);
  };

  const onAreaChange = (slug) => {
    router.push(`/${selectedCity}/${slug}/ramzan-timetable`);
  };

  return (
    <div className="w-full min-h-screen px-3 pb-12 bg-gradient-to-r from-neutral-200 to-neutral-400">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Bar */}
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur border rounded-full px-4 py-3 shadow flex flex-wrap gap-3 items-center justify-center">
          <select
            className="h-10 min-w-[140px] text-center text-sm font-medium border rounded-full px-4"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 min-w-[160px] text-center text-sm font-medium border rounded-full px-4"
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
          >
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-4">
          Ramzan Sehri & Iftar Timetable – {areaSlug.replace(/-/g, " ")},{" "}
          {citySlug.replace(/-/g, " ")}
        </h1>

        {loading ? (
          <div className="text-center text-slate-500">
            Loading Ramzan timings…
          </div>
        ) : days.length ? (
          <RamzanCards days={days} />
        ) : (
          <div className="text-center text-slate-600 italic">
            Ramzan timetable not configured for this location
          </div>
        )}
      </div>
    </div>
  );
}
