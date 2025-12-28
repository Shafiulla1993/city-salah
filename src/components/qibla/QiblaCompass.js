// src/components/qibla/QiblaCompass.js

"use client";

import CompassRing from "./CompassRing";
import KaabaIcon from "./KaabaIcon";
import QiblaInnerIndicator from "./QiblaInnerIndicator";

export default function QiblaCompass({ heading, qiblaBearing, distanceKm }) {
  const rotation = ((heading - qiblaBearing + 540) % 360) - 180;

  const aligned = Math.abs(rotation) < 3;
  const degreesLeft = Math.abs(rotation).toFixed(0);

  const rotateText =
    rotation > 0
      ? `Rotate ${degreesLeft}° right`
      : rotation < 0
      ? `Rotate ${degreesLeft}° left`
      : "Aligned";

  return (
    <div className="relative w-80 h-80 flex flex-col items-center justify-center">
      {/* Compass ring wrapper */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* OUTER RING (UNCHANGED) */}
        <CompassRing />

        {/* FIXED KAABA (TOP CENTER) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <KaabaIcon />
        </div>

        {/* ROTATING INNER INDICATOR (CENTERED) */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <QiblaInnerIndicator distanceKm={distanceKm} />
        </div>
      </div>
    </div>
  );
}
