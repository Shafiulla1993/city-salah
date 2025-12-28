// src/components/qibla/QiblaCompass.js

"use client";

import CompassDial from "./CompassDial";
import CenterArrow from "./CenterArrow";
import KaabaIcon from "./KaabaIcon";

export default function QiblaCompass({ heading, qibla }) {
  if (heading === null) {
    return <p className="text-white/70">Calibrating compass…</p>;
  }

  // Relative position of Kaaba
  const relative = (qibla - heading + 360) % 360;

  const aligned =
    Math.abs(((qibla - heading + 540) % 360) - 180) < 3;

  return (
    <div className="relative w-72 h-72 rounded-full bg-black flex items-center justify-center">

      {/* Rotating compass dial */}
      <CompassDial rotation={360 - heading} />

      {/* Kaaba (world fixed) */}
      <div
        className="absolute inset-0 flex justify-center items-start"
        style={{ transform: `rotate(${relative}deg)` }}
      >
        <div className="mt-2">
          <KaabaIcon />
        </div>
      </div>

      {/* Center arrow (YOU) */}
      <CenterArrow />

      {aligned && (
        <div className="absolute bottom-3 text-emerald-400">
          ✓ Aligned
        </div>
      )}
    </div>
  );
}
