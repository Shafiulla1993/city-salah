// src/components/masjid/MobileCarousel.js
"use client";

import React, { useState, useRef } from "react";
import MasjidCard from "./MasjidCard";

export default function MobileCarousel({ masjids = [], onExpand }) {
  const [index, setIndex] = useState(0);

  const startX = useRef(0);
  const lastX = useRef(0);
  const dragging = useRef(false);

  if (!masjids.length) return null;

  // Go Prev / Next
  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : masjids.length - 1));

  const goNext = () => setIndex((i) => (i < masjids.length - 1 ? i + 1 : 0));

  // -----------------------------
  // Swipe Handlers
  // -----------------------------
  const handleStart = (e) => {
    dragging.current = true;
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    lastX.current = startX.current;
  };

  const handleMove = (e) => {
    if (!dragging.current) return;
    lastX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    const delta = lastX.current - startX.current;

    if (delta > 60) goPrev(); // Swipe right
    else if (delta < -60) goNext(); // Swipe left
  };

  return (
    <div
      className="relative w-full overflow-hidden h-[88vh]"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* HINT TEXT */}
      <div className="absolute top-2 right-4 text-xs text-slate-500 z-20">
        ← Swipe →
      </div>

      {/* SLIDES TRACK */}
      <div
        className="flex transition-transform duration-500 h-full"
        style={{
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {masjids.map((m) => (
          <div key={m._id} className="w-full shrink-0 h-full px-2">
            <MasjidCard masjid={m} onExpand={onExpand} />
          </div>
        ))}
      </div>
    </div>
  );
}
