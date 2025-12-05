// src/app/auqatus-salah/page.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import { toast } from "react-toastify";
import PrayerTimingsTable from "@/components/RightPanel/PrayerTimingsTable";
import AuqatusTimingsLoader from "@/components/RightPanel/loaders";

export default function AuqatusSalahPage() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cities
  useEffect(() => {
    publicAPI.getCities().then(setCities);
  }, []);

  // Load areas when city changes
  useEffect(() => {
    if (!cityId) {
      setAreas([]);
      setAreaId("");
      return;
    }
    publicAPI.getAreas(cityId).then(setAreas);
  }, [cityId]);

  // Load timings
  const loadTimings = async () => {
    if (!cityId) return;
    setLoading(true);
    try {
      const res = await publicAPI.getGeneralTimings({ cityId, areaId, date });
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

  /* Ordered slot mapping for Auqatus Salah */
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-slate-900">
        Auqatus Salah
      </h1>

      {/* FILTER BAR */}
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CITY */}
          <select
            className="border px-3 py-2 rounded"
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

          {/* AREA */}
          <select
            className="border px-3 py-2 rounded"
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

          {/* DATE */}
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          onClick={loadTimings}
          className="w-full md:w-auto bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-900 transition"
        >
          Refresh Timings
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <AuqatusTimingsLoader />
      ) : timings ? (
        <PrayerTimingsTable
          prayerTimings={[{ slots: transformSlots(timings.slots) }]}
          masjidSelected={true}
          mode="auqatus"
        />
      ) : (
        <div className="text-center text-gray-600">
          {cityId
            ? "No timings found for this selection"
            : "Select city to view timings"}
        </div>
      )}
    </div>
  );
}
