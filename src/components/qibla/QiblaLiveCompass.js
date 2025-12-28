// src/components/qibla/QiblaLiveCompass.js

"use client";

import KaabaIcon from "./KaabaIcon";
import CenterArrow from "./CenterArrow";

export default function QiblaLiveCompass({ heading, qibla }) {
  if (heading === null) {
    return <p className="text-white/70">Calibrating compass…</p>;
  }

  /**
   * Compass dial rotation (visual only)
   */
  const compassRotation = 360 - heading;

  /**
   * Where Kaaba appears relative to YOU
   */
  const relativeAngle = (qibla - heading + 360) % 360;

  /**
   * Alignment check
   */
  const aligned =
    Math.abs(((qibla - heading + 540) % 360) - 180) < 3;

  return (
    <div className="relative w-80 h-80 rounded-full bg-black border border-white/20 shadow-xl flex items-center justify-center">

      {/* ROTATING COMPASS DIAL */}
      <div
        className="absolute inset-4 rounded-full transition-transform duration-300 ease-out"
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

        {/* Cardinal points */}
        {["N", "E", "S", "W"].map((d, i) => (
          <div
            key={d}
            className="absolute inset-0 flex justify-center items-start text-xs font-bold"
            style={{ transform: `rotate(${i * 90}deg)` }}
          >
            <span className="mt-5">{d}</span>
          </div>
        ))}
      </div>

      {/* 🕋 KAABA – WORLD FIXED (RELATIVE TO YOU) */}
      <div
        className="absolute inset-0 flex justify-center items-start pointer-events-none"
        style={{ transform: `rotate(${relativeAngle}deg)` }}
      >
        <div className="mt-3 flex flex-col items-center">
          <KaabaIcon />
          <span className="text-[10px] text-emerald-400">
            Qibla
          </span>
        </div>
      </div>

      {/* ▲ CENTER ARROW – YOU (FIXED) */}
      <div className="z-10 flex flex-col items-center">
        <CenterArrow />
        <span className="text-[10px] text-white/70 mt-1">
          You
        </span>
      </div>

      {/* ✓ ALIGNED */}
      {aligned && (
        <div className="absolute bottom-4 text-emerald-400 font-semibold">
          ✓ Aligned
        </div>
      )}
    </div>
  );
}
