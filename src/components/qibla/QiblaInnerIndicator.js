// src/components/qibla/QiblaInnerIndicator.js

"use client";

export default function QiblaInnerIndicator({ distanceKm }) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Small arrow – attached */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        className="absolute -top-3"
      >
        <polygon points="11,0 22,22 11,17 0,22" fill="#3b82f6" />
      </svg>

      {/* Distance circle */}
      <div className="w-20 h-20 rounded-full border-2 border-blue-500 flex flex-col items-center justify-center bg-black text-red-500 text-xs font-semibold">
        <div>Makka</div>
        <div>{distanceKm} km</div>
      </div>
    </div>
  );
}
