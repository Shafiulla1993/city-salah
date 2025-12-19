// src/components/masjid/MasjidCardFront.js
"use client";

import React from "react";
import usePrayerCountdown, {
  getPrevAndNextIqaamats,
} from "@/hooks/usePrayerCountdown";
import { normalizePrayerTimings } from "@/lib/helpers/normalizePrayerTimings";

export default function MasjidCardFront({ masjid }) {
  /* -----------------------------
     NEW BACKEND SAFE TIMINGS
  ----------------------------- */
  const raw = masjid?.prayerTimings?.[0] || {};
  const timings = normalizePrayerTimings(raw);

  // derive next & prev (same logic as old)
  const { next, prev } = getPrevAndNextIqaamats(timings);
  const { remainingStr, progress } = usePrayerCountdown(next?.time, prev?.time);

  /* -----------------------------
     OLD RING MATH (RESTORED)
  ----------------------------- */
  const safeProgress = Number.isFinite(progress) ? progress : 0;

  return (
    <div className="w-full h-full bg-stone-300 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div
        className="
          flex items-center justify-between
          px-4 py-2
          min-h-[48px] max-h-[72px]
        "
      >
        <div className="font-bold text-stone-900 text-sm leading-tight">
          Masjid e {masjid.name}
        </div>

        <div className="text-right text-black text-sm leading-tight">
          <div>Area: {masjid.area?.name}</div>
          <div>City: {masjid.city?.name}</div>
        </div>
      </div>

      {/* IMAGE */}
      <div className="w-full aspect-[4/5] bg-stone-300 overflow-hidden">
        <img
          src={masjid.imageUrl || "/Default_Image.png"}
          alt={masjid.name}
          className="w-full h-full object-contain p-2 shadow-2xl"
        />
      </div>

      {/* BOTTOM */}
      <div className="px-4 py-3 min-h-[96px] flex items-center justify-between">
        <div>
          <div className="text-md text-black font-bold">Upcoming</div>
          <div className="font-bold text-black uppercase">
            {next?.name || "--"}
          </div>
          <div className="text-md font-bold text-black">
            {next?.timeStr || "--:--"}
          </div>
        </div>

        {/* COUNTDOWN RING — EXACT OLD VERSION */}
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#8b5e34"
              strokeWidth="8"
              fill="none"
            />

            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#603808"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - safeProgress)}
              style={{
                transition: "stroke-dashoffset 1s linear",
              }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-900">
            {remainingStr}
          </div>
        </div>
      </div>
    </div>
  );
}
