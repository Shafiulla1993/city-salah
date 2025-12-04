// src/components/RightPanel/PrayerTimingsTable.js

"use client";
import React from "react";
import { Slab } from "react-loading-indicators"; // loader

// Convert 24-hour time → AM/PM
function to12Hour(time) {
  if (!time) return "-";

  // If already AM/PM → keep as is
  if (/am|pm/i.test(time)) return time.toUpperCase();

  // If no ":" or invalid → return as typed
  if (!time.includes(":")) return time;

  // 24h → 12h convert
  const [h, m] = time.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

export default function PrayerTimingsTable({
  prayerTimings,
  loading,
  masjidSelected,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Slab color="#32cd32" size="large" />
      </div>
    );
  }

  if (!masjidSelected) return null;

  if (masjidSelected && (!prayerTimings || prayerTimings.length === 0)) {
    return (
      <div className="bg-white shadow rounded p-4 text-center text-gray-500">
        No prayer timings available.
      </div>
    );
  }

  const timing = prayerTimings[0];

  const timingsArray = [
    { name: "Fajr", azan: timing.fajr?.azan, iqaamat: timing.fajr?.iqaamat },
    { name: "Zohar", azan: timing.Zohar?.azan, iqaamat: timing.Zohar?.iqaamat },
    { name: "Asr", azan: timing.asr?.azan, iqaamat: timing.asr?.iqaamat },
    {
      name: "Maghrib",
      azan: timing.maghrib?.azan,
      iqaamat: timing.maghrib?.iqaamat,
    },
    { name: "Isha", azan: timing.isha?.azan, iqaamat: timing.isha?.iqaamat },
  ];

  return (
    <div className="bg-white shadow rounded p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-2">Prayer Timings</h2>

      <table className="table-auto w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left border-b">Prayer</th>
            <th className="p-2 text-left border-b">Azaan</th>
            <th className="p-2 text-left border-b">Iqaamat</th>
          </tr>
        </thead>

        <tbody>
          {timingsArray.map((p, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{to12Hour(p.azan)}</td>
              <td className="p-2">{to12Hour(p.iqaamat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
