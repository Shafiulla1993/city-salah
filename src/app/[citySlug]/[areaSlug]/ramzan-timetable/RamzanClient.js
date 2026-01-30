// src/app/[citySlug]/[areaSlug]/ramzan-timetable/RamzanClient.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RamzanCards from "@/components/ramzan/RamzanCards";

export default function RamzanClient({ citySlug, areaSlug }) {
  const router = useRouter();

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  /* load cities */
  useEffect(() => {
    fetch("/api/public/cities")
      .then((r) => r.json())
      .then(setCities);
  }, []);

  /* load areas for city */
  useEffect(() => {
    const city = cities.find((c) => c.slug === citySlug);
    if (!city) return;

    fetch(`/api/public/areas?cityId=${city._id}`)
      .then((r) => r.json())
      .then(setAreas);
  }, [cities, citySlug]);

  /* load ramzan month */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch(
        `/api/public/ramzan-timetable?citySlug=${citySlug}&areaSlug=${areaSlug}`,
      );
      const data = await res.json();

      // 🔁 city-only fallback
      if (!data.success && areaSlug) {
        router.replace(`/${citySlug}/ramzan-timetable`);
        return;
      }

      setDays(data.days || []);
      setLoading(false);
    }

    load();
  }, [citySlug, areaSlug, router]);

  /* handlers */
  const onCityChange = async (slug) => {
    const city = cities.find((c) => c.slug === slug);
    if (!city) return;

    const res = await fetch(`/api/public/areas?cityId=${city._id}`);
    const list = await res.json();

    if (list.length) {
      router.push(`/${slug}/${list[0].slug}/ramzan-timetable`);
    } else {
      router.push(`/${slug}/ramzan-timetable`);
    }
  };

  const onAreaChange = (slug) => {
    router.push(`/${citySlug}/${slug}/ramzan-timetable`);
  };

  return (
    <div className="w-full min-h-screen px-3 pb-12 bg-slate-100">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top selector */}
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur border rounded-full px-4 py-3 shadow flex gap-3 justify-center">
          <select
            value={citySlug}
            onChange={(e) => onCityChange(e.target.value)}
            className="h-10 min-w-[140px] text-center border rounded-full px-4"
          >
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {areas.length > 0 && (
            <select
              value={areaSlug}
              onChange={(e) => onAreaChange(e.target.value)}
              className="h-10 min-w-[160px] text-center border rounded-full px-4"
            >
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Ramzan Sehri & Iftar – {areaSlug?.replace(/-/g, " ")},{" "}
          {citySlug.replace(/-/g, " ")}
        </h1>

        {loading ? (
          <div className="text-center text-slate-500">
            Loading Ramzan timings…
          </div>
        ) : (
          <RamzanCards days={days} />
        )}
      </div>
    </div>
  );
}
