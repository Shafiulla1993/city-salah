// src/components/auqatus/AuqatusCards.js

"use client";

import React from "react";

/* ---------------- Time format ---------------- */
function to12Hour(time) {
  if (time === null || time === undefined) return "--";

  if (typeof time === "number") {
    const m = time % 60;
    let h = Math.floor(time / 60);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  if (typeof time === "string") {
    if (/am|pm/i.test(time)) return time.toUpperCase();
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

  return "--";
}

/* ---------------- Compact Card ---------------- */
function PrayerTimeCard({ title, start, end, highlight }) {
  return (
    <div
      className={`
        rounded-lg border shadow-sm
        px-3 py-2
        flex flex-col justify-between
        ${
          highlight
            ? "bg-green-200 border-green-400"
            : "bg-slate-200 border-slate-900"
        }
      `}
    >
      {/* Title */}
      <div className="text-sm font-bold text-slate-900 leading-tight">
        {title}
      </div>

      {/* Times */}
      <div className="mt-1 space-y-0.5">
        <div className="text-md font-bold text-slate-700">
          <span className="font-semibold">Start:</span> {to12Hour(start)}
        </div>
        <div className="text-md font-bold text-slate-700">
          <span className="font-semibold">End:</span> {to12Hour(end)}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Grid ---------------- */
export default function AuqatusCards({ slots = [] }) {
  if (!slots.length) return null;

  return (
    <div
      className="
        grid
        grid-cols-2          /* ✅ mobile: 2 cards per row */
        sm:grid-cols-3       /* tablet */
        lg:grid-cols-4       /* desktop */
        gap-3                /* tighter spacing */
      "
    >
      {slots.map((s, idx) => (
        <PrayerTimeCard
          key={`${s.label}-${idx}`} // ✅ FIXED KEY
          title={s.label}
          start={s.start}
          end={s.end}
          highlight={s.highlight}
        />
      ))}
    </div>
  );
}
