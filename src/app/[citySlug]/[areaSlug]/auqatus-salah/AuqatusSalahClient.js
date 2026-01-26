// src/app/[citySlug]/[areaSlug]/auqatus-salah/AuqatusSalahClient.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuqatusCards from "@/components/auqatus/AuqatusCards";
import { AuqatusTimingsLoader } from "@/components/masjid/loaders";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";

export default function AuqatusSalahClient({ citySlug, areaSlug }) {
  const router = useRouter();

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState(citySlug);
  const [selectedArea, setSelectedArea] = useState(areaSlug);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Load Cities ---------------- */
  useEffect(() => {
    fetch("/api/public/cities")
      .then((r) => r.json())
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  /* ---------------- Load Areas ---------------- */
  useEffect(() => {
    const city = cities.find((c) => c.slug === selectedCity);
    if (!city) return;

    fetch(`/api/public/areas?cityId=${city._id || city.id || city._id}`)
      .then((r) => r.json())
      .then(setAreas)
      .catch(() => setAreas([]));
  }, [cities, selectedCity]);

  useEffect(() => {
    setSelectedCity(citySlug);
    setSelectedArea(areaSlug);
  }, [citySlug, areaSlug]);

  /* ---------------- Load Timings ---------------- */
  const loadTimings = async () => {
    try {
      setLoading(true);

      const qs = new URLSearchParams({
        citySlug: selectedCity,
        areaSlug: selectedArea,
        date, // ✅ send full YYYY-MM-DD
      }).toString();

      const res = await fetch(`/api/public/prayer-timings/today?${qs}`, {
        cache: "no-store",
      });

      const data = await res.json();
      setTimings(data?.success ? data : null);
    } catch (e) {
      console.error("Awqatus load error:", e);
      setTimings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity && selectedArea) loadTimings();
  }, [selectedCity, selectedArea, date]);

  /* ---------------- Switch City ---------------- */
  const onCityChange = async (newCitySlug) => {
    const city = cities.find((c) => c.slug === newCitySlug);
    if (!city) return;

    const res = await fetch(`/api/public/areas?cityId=${city._id}`);
    const areasList = await res.json();

    if (!areasList.length) return;

    const firstAreaSlug = areasList[0].slug;

    router.push(`/${newCitySlug}/${firstAreaSlug}/auqatus-salah`);
  };

  /* ---------------- Switch Area ---------------- */
  const onAreaChange = (newAreaSlug) => {
    router.push(`/${selectedCity}/${newAreaSlug}/auqatus-salah`);
  };

  const slots = normalizeGeneralTimings(timings);

  return (
    <div className="w-full min-h-screen px-3 pb-12 bg-gradient-to-r from-neutral-200 to-neutral-400">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Compact Bar */}
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur border rounded-full px-4 py-3 shadow flex flex-wrap gap-3 items-center justify-center">
          {/* City */}
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

          {/* Area */}
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

          {/* Date */}
          <input
            type="date"
            className="h-10 text-center text-sm font-medium border rounded-full px-4"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-4">
          Auqatus Salah – {areaSlug.replace(/-/g, " ")},{" "}
          {citySlug.replace(/-/g, " ")}
        </h1>

        {/* Content */}
        {loading ? (
          <AuqatusTimingsLoader />
        ) : slots.length ? (
          <AuqatusCards slots={slots} />
        ) : (
          <div className="text-center text-slate-600 italic">
            Timings not available for this location
          </div>
        )}
      </div>
    </div>
  );
}
