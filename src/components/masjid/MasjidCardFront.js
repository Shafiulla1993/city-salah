// src/components/masjid/MasjidCardFront.js
"use client";

import React from "react";
import usePrayerCountdown, {
  getPrevAndNextIqaamats,
} from "@/hooks/usePrayerCountdown";

export default function MasjidCardFront({ masjid }) {
  const timings = masjid.prayerTimings?.[0] || {};

  // ✅ derive next & prev correctly
  const { next, prev } = getPrevAndNextIqaamats(timings);

  // ✅ pass correct arguments to hook
  const { remainingStr, progress } = usePrayerCountdown(next?.time, prev?.time);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - circumference * (Number.isFinite(progress) ? progress : 0);

  return (
    <div className="w-full h-full bg-white rounded-2xl flex flex-col overflow-hidden">
      {/* HEADER — 10% */}
      <div className="h-[10%] flex items-center justify-between px-4">
        <div className="font-bold text-slate-900 text-lg">{masjid.name}</div>

        <div className="text-right text-slate-500 text-sm leading-tight">
          <div>{masjid.area?.name}</div>
          <div>{masjid.city?.name}</div>
        </div>
      </div>

      {/* IMAGE — 70% */}
      <div className="h-[70%] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
        <img
          src={masjid.imageUrl || "/Default_Image.png"}
          alt={masjid.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* BOTTOM — 20% */}
      <div className="h-[20%] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Upcoming</div>
          <div className="font-semibold text-slate-800 uppercase">
            {next?.name || "--"}
          </div>
          <div className="text-sm font-mono text-slate-600">
            {next?.timeStr || "--:--"}
          </div>
        </div>

        {/* Countdown Ring */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90">
            {/* Background track */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#cbd5e1" // slate-300
              strokeWidth="6"
              fill="transparent"
            />

            {/* Progress ring */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#16a34a" // strong green
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-800 tracking-tigh">
            {remainingStr}
          </div>
        </div>
      </div>
    </div>
  );
}
