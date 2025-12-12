// src/components/masjid/MasjidCard.js
"use client";

import { useState, useRef, useEffect } from "react";
import MasjidCardFront from "./MasjidCardFront";
import MasjidCardBack from "./MasjidCardBack";
import "@/styles/flip.css";

export default function MasjidCard({ masjid, onExpand }) {
  const [flipped, setFlipped] = useState(false);

  const startY = useRef(0);
  const moved = useRef(false);

  // When back side is open → lock body scroll
  useEffect(() => {
    document.body.style.overflow = flipped ? "hidden" : "";
    document.documentElement.style.overflow = flipped ? "hidden" : "";
  }, [flipped]);

  // Detect swipe vs click
  const beginPointer = (e) => {
    startY.current = e.clientY;
    moved.current = false;
  };

  const detectMove = (e) => {
    if (Math.abs(e.clientY - startY.current) > 10) moved.current = true;
  };

  const endPointer = () => {
    if (moved.current) return; // scrolling, NOT flip

    if (!flipped) onExpand?.(masjid);
    setFlipped((x) => !x);
  };

  return (
    <div
      className={`relative w-full h-[78vh] lg:h-[72vh] xl:h-[75vh] rounded-2xl card 
        ${flipped ? "card-flipped" : ""}`}
      onPointerDown={beginPointer}
      onPointerMove={detectMove}
      onPointerUp={endPointer}
    >
      <div className="card-inner rounded-2xl">
        {/* FRONT */}
        <div className="card-face card-front rounded-2xl overflow-hidden">
          <MasjidCardFront masjid={masjid} />
        </div>

        {/* BACK */}
        <div className="card-face card-back rounded-2xl overflow-y-auto overscroll-contain">
          <MasjidCardBack masjid={masjid} />
        </div>
      </div>
    </div>
  );
}
