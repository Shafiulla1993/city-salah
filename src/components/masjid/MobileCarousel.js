// src/components/masjid/MobileCarousel.js

"use client";

import React, { useState, useRef, useEffect } from "react";
import MasjidCard from "./MasjidCard";

export default function MobileCarousel({ masjids = [], onExpand }) {
  if (!masjids.length) return null;

  const slides = [masjids[masjids.length - 1], ...masjids, masjids[0]];

  const [index, setIndex] = useState(1);
  const [animating, setAnimating] = useState(true);
  const [dragX, setDragX] = useState(0);

  const startX = useRef(0);
  const dragging = useRef(false);

  /* -----------------------------
     Swipe handlers
  ----------------------------- */
  const handleStart = (e) => {
    dragging.current = true;
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    setAnimating(false);
  };

  const handleMove = (e) => {
    if (!dragging.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setDragX(x - startX.current);
  };

  const handleEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    if (dragX > 60) setIndex((i) => i - 1);
    else if (dragX < -60) setIndex((i) => i + 1);

    setDragX(0);
    setAnimating(true);
  };

  /* -----------------------------
     Infinite loop correction
  ----------------------------- */
  useEffect(() => {
    if (index === 0) {
      setTimeout(() => {
        setAnimating(false);
        setIndex(slides.length - 2);
      }, 300);
    }

    if (index === slides.length - 1) {
      setTimeout(() => {
        setAnimating(false);
        setIndex(1);
      }, 300);
    }
  }, [index, slides.length]);

  useEffect(() => {
    if (!animating) {
      requestAnimationFrame(() => setAnimating(true));
    }
  }, [animating]);

  /* -----------------------------
     3D math
  ----------------------------- */
  const swipeProgress = Math.max(-1, Math.min(1, dragX / 160));
  const rotateY = swipeProgress * -12; // degrees
  const scale = 1 - Math.abs(swipeProgress) * 0.06;

  return (
    <div
      className="relative w-full overflow-hidden h-[88vh]"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      style={{ perspective: "1200px" }}
    >
      {/* TRACK */}
      <div
        className={`flex h-full ${
          animating ? "transition-transform duration-300 ease-out" : ""
        }`}
        style={{
          transform: `translateX(calc(-${index * 100}% + ${dragX}px))`,
        }}
      >
        {slides.map((m, i) => {
          const isActive = i === index;

          return (
            <div
              key={`${m._id}-${i}`}
              className="w-full shrink-0 h-full px-2 flex justify-center"
              style={{
                transform: isActive
                  ? `scale(${scale}) rotateY(${rotateY}deg)`
                  : "scale(0.94)",
                transition: animating ? "transform 0.3s ease" : "none",
                transformStyle: "preserve-3d",
              }}
            >
              <MasjidCard masjid={m} onExpand={onExpand} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
