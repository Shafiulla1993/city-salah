// src/components/qibla/QiblaCompass.js

"use client";

import DegreeRing from "./DegreeRing";
import KaabaIcon from "./KaabaIcon";

export default function QiblaCompass({
  qiblaAngle,
  heading,
  aligned,
}) {
  // Where Kaaba should be on the compass
  const kaabaRotation =
    heading !== null
      ? qiblaAngle - heading
      : qiblaAngle;

  return (
    <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-emerald-950 to-black border border-white/20 shadow-2xl flex items-center justify-center">

      {/* Degree ring (STATIC) */}
      <div className="absolute inset-4 rounded-full border border-white/20">
        <DegreeRing />

        {/* N E S W */}
        {["N", "E", "S", "W"].map((d, i) => (
          <div
            key={d}
            className="absolute inset-0 flex justify-center items-start text-xs font-semibold text-white"
            style={{ transform: `rotate(${i * 90}deg)` }}
          >
            <span className="mt-6">{d}</span>
          </div>
        ))}
      </div>

      {/* Kaaba indicator (ROTATES) */}
      <div
        className="absolute inset-0 flex justify-center items-start transition-transform duration-300 ease-out"
        style={{ transform: `rotate(${kaabaRotation}deg)` }}
      >
        <div className="mt-3 flex flex-col items-center">
          <KaabaIcon />
          <span className="text-[10px] text-emerald-400 mt-1">
            Qibla
          </span>
        </div>
      </div>

      {/* Center dot */}
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
