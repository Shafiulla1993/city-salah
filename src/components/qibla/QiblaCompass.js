// src/components/qibla/QiblaCompass.js

"use client";

import DegreeRing from "./DegreeRing";
import KaabaIcon from "./KaabaIcon";

export default function QiblaCompass({
  qiblaAngle,
  heading,
  aligned,
}) {
  const compassRotation =
    heading !== null ? -heading : 0;

  return (
    <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-emerald-950 to-black border border-white/20 shadow-2xl flex items-center justify-center">

      {/* ROTATING COMPASS */}
      <div
        className="absolute inset-4 rounded-full border border-white/20 transition-transform duration-300 ease-out"
        style={{ transform: `rotate(${compassRotation}deg)` }}
      >
        {/* Degree marks */}
        <DegreeRing />

        {/* Cardinal points */}
        {["N", "E", "S", "W"].map((d, i) => (
          <div
            key={d}
            className="absolute inset-0 flex justify-center items-start text-xs font-semibold text-white"
            style={{ transform: `rotate(${i * 90}deg)` }}
          >
            <span className="mt-5">{d}</span>
          </div>
        ))}

        {/* KAABA — FIXED ON COMPASS */}
        <div
          className="absolute inset-0 flex justify-center items-start"
          style={{ transform: `rotate(${qiblaAngle}deg)` }}
        >
          <div className="mt-2 flex flex-col items-center">
            <KaabaIcon />
            <span className="text-[10px] text-emerald-400 mt-1">
              Qibla
            </span>
          </div>
        </div>
      </div>

      {/* Center */}
      <div className="w-3 h-3 bg-white rounded-full z-10" />

      {/* Aligned indicator */}
      {aligned && (
        <div className="absolute bottom-6 text-emerald-400 text-sm font-semibold">
          ✓ Aligned
        </div>
      )}
    </div>
  );
}
