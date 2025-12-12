// src/components/masjid/MasjidCardFront.js
"use client";

import React from "react";
import usePrayerCountdown from "@/hooks/usePrayerCountdown";

export default function MasjidCardFront({ masjid }) {
  const timings = masjid.prayerTimings?.[0] || {};

  const {
    nextPrayer = null,
    nextTime = null,
    secondsLeft = null,
    percent = 0,
  } = usePrayerCountdown(timings);

  const safePercent = Number.isFinite(percent) ? percent : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = (circumference * (100 - safePercent)) / 100;

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
          <div className="font-semibold text-slate-800">
            {nextPrayer ? nextPrayer.toUpperCase() : "--"}
          </div>
          <div className="text-sm font-mono text-slate-600">
            {nextTime || "-- : --"}
          </div>
        </div>

        {/* Countdown */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full rotate-[-90deg]">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#6366f1"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700">
            {Number.isFinite(secondsLeft) ? `${secondsLeft}s` : "--"}
          </div>
        </div>
      </div>
    </div>
  );
}
