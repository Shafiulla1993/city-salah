// src/app/auqatus-salah/AuqatusSalahCLient.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import { toast } from "react-toastify";
import PrayerTimingsTable from "@/components/masjid/PrayerTimingsTable";
import { AuqatusTimingsLoader } from "@/components/masjid/loaders";

export default function AuqatusSalahClient() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- Restore selection ---------------- */
  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCityId");
    const savedArea = localStorage.getItem("selectedAreaId");
    if (savedCity) setCityId(savedCity);
    if (savedArea) setAreaId(savedArea);
  }, []);

  /* ---------------- Load cities ---------------- */
  useEffect(() => {
    publicAPI.getCities().then(setCities);
  }, []);

  /* ---------------- Load areas ---------------- */
  useEffect(() => {
    if (!cityId) {
      setAreas([]);
      setAreaId("");
      return;
    }
    publicAPI.getAreas(cityId).then(setAreas);
  }, [cityId]);

  /* ---------------- Fetch timings ---------------- */
  const loadTimings = async () => {
    if (!cityId) return;
    setLoading(true);
    try {
      const res = await publicAPI.getGeneralTimings({
        cityId,
        areaId,
        date,
      });
      if (res?.success) setTimings(res.data);
      else setTimings(null);
    } catch {
      toast.error("Failed to load timings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityId) loadTimings();
  }, [cityId, areaId, date]);

  /* ---------------- PAGE UI TRANSFORM (UNCHANGED) ---------------- */
  function transformSlots(slots = []) {
    const map = Object.fromEntries(slots.map((s) => [s.name, s]));

    const ordering = [
      ["Sehri", "sehri_start", "sehri_end"],
      ["Fajr", "fajr_start", "fajr_end"],
      ["Ishraq", "ishraq_start", "ishraq_end"],
      ["Chasht", "chasht_start", "chasht_end"],
      ["Zawaal", "zawaal_start", "zawaal_end"],
      ["Zohar", "zohar_start", "zohar_end"],
      ["Asar (Shafi)", "asar_shafi_start", "asar_shafi_end"],
      ["Asar (Hanafi)", "asar_hanafi_start", "asar_hanafi_end"],
      ["Maghrib", "maghrib_start", "maghrib_end"],
      ["Isha", "isha_start", "isha_end"],
    ];

    return ordering
      .map(([label, startKey, endKey]) => ({
        name: label,
        start: map[startKey]?.time ?? null,
        end: map[endKey]?.time ?? null,
      }))
      .filter((row) => row.start !== null || row.end !== null);
  }

  /* ---------------- OG IMAGE (START TIMES ONLY) ---------------- */

  // Convert minutes → HH:mm
  function minutesToHHMM(min) {
    if (typeof min !== "number") return null;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Extract ONLY start times for OG image
  const ogStartTimes =
  timings?.slots
    ?.filter((s) => s.name.endsWith("_start"))
    .map((s) => ({
      key: s.name.replace("_start", ""), // e.g. fajr, zohar, asar_shafi
      time: minutesToHHMM(s.time),
    }))
    .filter((s) => s.time) || [];

const ogImageUrl =
  ogStartTimes.length > 0
    ? `/api/og/auqatus-salah?${ogStartTimes
        .map((s) => `${s.key}=${encodeURIComponent(s.time)}`)
        .join("&")}`
    : "/api/og/auqatus-salah";


  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen w-full px-3 py-2 space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">
        Auqatus Salah
      </h1>

      {/* Filters */}
      <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="h-10 rounded-md border px-3"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="h-10 rounded-md border px-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          onClick={loadTimings}
          className="bg-indigo-600 text-white px-8 py-2 rounded-md"
        >
          Refresh Timings
        </button>
      </div>

      {loading ? (
        <AuqatusTimingsLoader />
      ) : timings ? (
        <PrayerTimingsTable
          prayerTimings={[{ slots: transformSlots(timings.slots) }]}
          masjidSelected
          mode="auqatus"
        />
      ) : (
        <div className="text-center text-gray-600 italic">
          Select a city to view timings
        </div>
      )}

      {timings && (
  <button
    onClick={() => {
      const shareUrl = `${window.location.origin}${ogImageUrl}`;

      if (navigator.share) {
        navigator.share({
          title: "Auqatus Salah – Prayer Times",
          text: "Today’s prayer start times",
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert("Share link copied!");
      }
    }}
    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md shadow"
  >
    Share Prayer Times
  </button>
)}

    </div>
  );
}
