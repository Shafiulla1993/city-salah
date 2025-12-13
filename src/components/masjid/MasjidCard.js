"use client";

import { useState, useRef, useEffect } from "react";
import MasjidCardFront from "./MasjidCardFront";
import MasjidCardBack from "./MasjidCardBack";
import "@/styles/flip.css";

export default function MasjidCard({ masjid, onExpand }) {
  const [flipped, setFlipped] = useState(false);

  const startY = useRef(0);
  const moved = useRef(false);

  /* -----------------------------
      FIX: DO NOT lock entire body
      Only block scroll when back
  ----------------------------- */
  useEffect(() => {
    if (flipped) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [flipped]);

  /* -----------------------------
      Tap / Scroll detection
  ----------------------------- */
  const beginPointer = (e) => {
    startY.current = e.clientY;
    moved.current = false;
  };

  const detectMove = (e) => {
    const diff = Math.abs(e.clientY - startY.current);
    if (diff > 10) moved.current = true;
  };

  const endPointer = () => {
    if (moved.current) return;

    if (!flipped) onExpand?.(masjid);
    setFlipped((v) => !v);
  };

  /* -----------------------------
      FIX: Wrapper height MUST be fixed
      Flip inside inner container,
      NOT on wrapper.
  ----------------------------- */
  const FIXED_HEIGHT = "82vh";

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto rounded-2xl overflow-visible"
      style={{ height: FIXED_HEIGHT }}
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
          <MasjidCardBack masjid={masjid} />
        </div>
      </div>
    </div>
  );
}
