// src/components/masjid/PrayerTimingsTable.js

"use client";
import React from "react";
import { Slab } from "react-loading-indicators";

function to12Hour(time) {
  if (time === null || time === undefined || time === "-") return "-";

  // If time is minutes (number)
  if (typeof time === "number") {
    const total = time;
    const m = total % 60;
    let h = Math.floor(total / 60);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // If already string (24h or AM/PM)
  if (typeof time === "string") {
    if (/am|pm/i.test(time)) return time.toUpperCase();
    if (time.includes(":")) {
      const [h, m] = time.split(":");
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${m} ${ampm}`;
    }
  }

  return "-";
}

export default function PrayerTimingsTable({
  prayerTimings,
  loading,
  masjidSelected,
  mode,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Slab color="#32cd32" size="large" />
      </div>
    );
  }

  if (!masjidSelected) return null;

  if (!prayerTimings || prayerTimings.length === 0) {
    return (
      <div className="bg-white shadow rounded p-4 text-center text-gray-500 font-medium">
        No prayer timings available
      </div>
    );
  }

  // ---- NORMAL MASJID MODE ----
  if (mode !== "auqatus") {
    const timing = prayerTimings[0];
    const timingsArray = [
      { name: "Fajr", azan: timing.fajr?.azan, iqaamat: timing.fajr?.iqaamat },
      {
        name: "Zohar",
        azan: timing.Zohar?.azan,
        iqaamat: timing.Zohar?.iqaamat,
      },
      { name: "Asr", azan: timing.asr?.azan, iqaamat: timing.asr?.iqaamat },
      {
        name: "Maghrib",
        azan: timing.maghrib?.azan,
        iqaamat: timing.maghrib?.iqaamat,
      },
      { name: "Isha", azan: timing.isha?.azan, iqaamat: timing.isha?.iqaamat },
      { name: "Juma", azan: timing.juma?.azan, iqaamat: timing.juma?.iqaamat },
    ];

    return (
      <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3 text-slate-800">
          Prayer Timings
        </h2>
        <table className="w-full border border-gray-200 table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-center border-b font-bold">Prayer</th>
              <th className="p-2 text-center border-b font-bold">Azaan</th>
              <th className="p-2 text-center border-b font-bold">Iqaamat</th>
            </tr>
          </thead>
          <tbody>
            {timingsArray.map((p, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2 text-center font-semibold">{p.name}</td>
                <td className="p-2 text-center text-slate-800">
                  {to12Hour(p.azan)}
                </td>
                <td className="p-2 text-center text-slate-800">
                  {to12Hour(p.iqaamat)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ---- AUQATUS MODE (special table) ----
  const slots = prayerTimings[0].slots || [];

  return (
    <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6 overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center text-slate-900 tracking-wide">
        Auqatus Salah Timings
      </h2>

      <table className="w-full border border-slate-200/60 table-fixed rounded-lg overflow-hidden">
        <thead className="bg-slate-100/80">
          <tr>
            <th className="px-3 py-2 text-center border-b font-bold text-slate-900 w-1/3">
              Name
            </th>
            <th className="px-3 py-2 text-center border-b font-bold text-slate-900 w-1/3">
              Start
            </th>
            <th className="px-3 py-2 text-center border-b font-bold text-slate-900 w-1/3">
              End
            </th>
          </tr>
        </thead>

        <tbody>
          {slots.map((s) => (
            <tr key={s.name} className="border-b hover:bg-slate-50 transition">
              <td className="px-3 py-2 text-center font-semibold capitalize text-slate-900">
                {s.name.replace(/\s*\(.*?\)/, "").replace(/_/g, " ")}
              </td>
              <td className="px-3 py-2 text-center text-slate-800 font-medium">
                {to12Hour(s.start)}
              </td>
              <td className="px-3 py-2 text-center text-slate-800 font-medium">
                {to12Hour(s.end)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}