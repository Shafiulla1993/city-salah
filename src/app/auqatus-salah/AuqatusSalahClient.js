// src/app/auqatus-salah/AuqatusSalahCLient.js

"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";
import { toast } from "react-toastify";
import AuqatusCards from "@/components/auqatus/AuqatusCards";
import { AuqatusTimingsLoader } from "@/components/masjid/loaders";
import { normalizeGeneralTimings } from "@/lib/helpers/normalizeGeneralTimings";

export default function AuqatusSalahClient() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- Restore ---------------- */
  useEffect(() => {
    const c = localStorage.getItem("selectedCityId");
    const a = localStorage.getItem("selectedAreaId");
    if (c) setCityId(c);
    if (a) setAreaId(a);
  }, []);

  useEffect(() => {
    publicAPI.getCities().then(setCities);
  }, []);

  useEffect(() => {
    if (!cityId) {
      setAreas([]);
      setAreaId("");
      return;
    }
    publicAPI.getAreas(cityId).then(setAreas);
  }, [cityId]);

  /* ---------------- Load timings ---------------- */
  const loadTimings = async () => {
    if (!cityId) return;
    setLoading(true);
    try {
      const res = await publicAPI.getGeneralTimings({
        cityId,
        areaId,
        date,
      });
      setTimings(res?.success ? res.data : null);
    } catch {
      toast.error("Failed to load timings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityId) loadTimings();
  }, [cityId, areaId, date]);

  /* ---------------- Transform slots ---------------- */
  const slots = normalizeGeneralTimings(timings);

  const shareAuqatus = () => {
    const shareUrl = "https://citysalah.in/auqatus-salah";

    if (navigator.share) {
      navigator.share({
        title: "Auqatus Salah | CitySalah",
        text: "View accurate prayer timings for your city",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Share link copied!");
    }
  };

  return (
    <div className="w-full min-h-screen  px-3 pb-12 bg-gradient-to-r from-neutral-200 to-neutral-400">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Auqatus Salah
        </h1>

        {/* Filters */}
        <div className="bg-stone-200 rounded-xl shadow-xl border border-white/40 backdrop-blur p-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-md font-semibold mr-7"
          >
            Refresh Timings
          </button>
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/auqatus-salah`;

              if (navigator.share) {
                navigator.share({
                  title: "Auqatus Salah | CitySalah",
                  text: "View accurate prayer timings for your city",
                  url: shareUrl,
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert("Share link copied!");
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md font-semibold"
          >
            Share Auqatus Salah
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <AuqatusTimingsLoader />
        ) : slots.length ? (
          <AuqatusCards slots={slots} />
        ) : (
          <div className="text-center text-slate-600 italic">
            Select a city to view timings
          </div>
        )}
      </div>
    </div>
  );
}
