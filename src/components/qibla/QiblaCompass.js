"use client";

export default function QiblaCompass({ bearing, heading }) {
  if (bearing === null) return null;
  const rotation = bearing - heading;

  return (
    <div className="relative w-64 h-64 rounded-full bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
      <div className="absolute inset-4 rounded-full border border-white/20" />
      <div
        className="absolute w-1 h-28 bg-emerald-400 origin-bottom"
        style={{ transform: `rotate(${rotation}deg)` }}
      />
      <div className="w-3 h-3 bg-white rounded-full z-10" />
    </div>
  );
}
