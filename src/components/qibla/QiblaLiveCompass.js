// src/components/qibla/QiblaLiveCompass.js

"use client";

import KaabaIcon from "./KaabaIcon";

export default function QiblaLiveCompass({ heading, qibla }) {
  if (heading === null) {
    return <p className="text-white/70">Calibrating compass…</p>;
  }

  const compassRotation = -heading;

  const diff = Math.abs(((heading - qibla + 540) % 360) - 180);
  const aligned = diff < 3;

  return (
    <div className="relative w-80 h-80 rounded-full bg-black border border-white/20 shadow-xl flex items-center justify-center">

      {/* ROTATING COMPASS */}
      <div
        className="absolute inset-4 rounded-full transition-transform duration-300"
        style={{ transform: `rotate(${compassRotation}deg)` }}
      >
        {/* Degree ticks */}
        {[...Array(36)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${i * 10}deg)` }}
          >
            <div className="h-3 w-px bg-white/50 mt-2" />
          </div>
        ))}

        {/* N E S W */}
        {["N", "E", "S", "W"].map((d, i) => (
          <div
            key={d}
            className="absolute inset-0 flex justify-center items-start text-xs font-bold"
            style={{ transform: `rotate(${i * 90}deg)` }}
          >
            <span className="mt-5">{d}</span>
          </div>
        ))}

        {/* KAABA FIXED ON COMPASS */}
        <div
          className="absolute inset-0 flex justify-center items-start"
          style={{ transform: `rotate(${qibla}deg)` }}
        >
          <div className="mt-2 flex flex-col items-center">
            <KaabaIcon />
            <span className="text-[10px] text-emerald-400">Qibla</span>
          </div>
        </div>
      </div>

      <div className="w-3 h-3 bg-white rounded-full z-10" />

      {aligned && (
        <div className="absolute bottom-4 text-emerald-400 font-semibold">
          ✓ Aligned
        </div>
      )}
    </div>
  );
}
