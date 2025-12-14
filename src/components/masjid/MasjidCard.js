// src/components/masjid/MasjidCard.js

"use client";

import { useState, useRef, useEffect } from "react";
import MasjidCardFront from "./MasjidCardFront";
import MasjidCardBack from "./MasjidCardBack";
import "@/styles/flip.css";
import { MasjidCardBackSkeleton } from "./loaders";

export default function MasjidCard({ masjid, onExpand, onFlipChange }) {
  const [flipped, setFlipped] = useState(false);

  const startY = useRef(0);
  const moved = useRef(false);

  /* -----------------------------
      Lock scroll only when flipped
  ----------------------------- */
  useEffect(() => {
    document.body.style.overflow = flipped ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [flipped]);

  /* -----------------------------
      Tap / Scroll detection
  ----------------------------- */
  const beginPointer = (e) => {
    startY.current = e.clientY;
    moved.current = false;
  };

  const detectMove = (e) => {
    if (Math.abs(e.clientY - startY.current) > 10) {
      moved.current = true;
    }
  };

  const endPointer = () => {
    if (moved.current) return;

    const nextFlipped = !flipped;

    if (!flipped) onExpand?.(masjid);

    setFlipped(nextFlipped);
    onFlipChange?.(nextFlipped, masjid);
  };

  return (
    <div
      className="
        relative
        w-full
        max-w-[420px]
        mx-auto
        rounded-2xl
        overflow-visible

        /* 📱 MOBILE */
        aspect-[3/5]
        max-h-[70vh]

        /* 🖥 DESKTOP */
        lg:aspect-auto
        lg:h-[82vh]
      "
      onPointerDown={beginPointer}
      onPointerMove={detectMove}
      onPointerUp={endPointer}
    >
      {/* 3D card */}
      <div
        className={`card-inner w-full h-full rounded-2xl ${
          flipped ? "card-flipped" : ""
        }`}
      >
        {/* FRONT */}
        <div className="card-face card-front w-full h-full rounded-2xl overflow-hidden bg-white">
          <MasjidCardFront masjid={masjid} />
        </div>

        {/* BACK */}
        <div
          className="card-face card-back w-full h-full rounded-2xl overflow-y-auto bg-white"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {masjid?.fullDetailsLoading ? (
            <MasjidCardBackSkeleton />
          ) : (
            <MasjidCardBack masjid={masjid} />
          )}
        </div>
      </div>
    </div>
  );
}
