// src/components/masjid/MasjidCard.js

"use client";

import { useState, useRef, useEffect } from "react";
import MasjidCardFront from "./MasjidCardFront";
import MasjidCardBack from "./MasjidCardBack";
import "@/styles/flip.css";
import { publicAPI } from "@/lib/api/public";

export default function MasjidCard({
  masjid,
  onExpand,
  onFlipChange,
  onUpdateMasjid,
}) {
  const [flipped, setFlipped] = useState(false);

  const startY = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    document.body.style.overflow = flipped ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [flipped]);

  const beginPointer = (e) => {
    startY.current = e.clientY;
    moved.current = false;
  };

  const detectMove = (e) => {
    if (Math.abs(e.clientY - startY.current) > 10) moved.current = true;
  };

  const endPointer = async () => {
    if (moved.current) return;

    const next = !flipped;

    // 🔥 LOAD PRAYER TIMINGS ON FIRST FLIP
    if (!flipped && masjid.prayerTimings?.length === 0) {
      try {
        const res = await publicAPI.getPrayerTimings(masjid._id);

        if (res?.success && res.data) {
          onUpdateMasjid?.({
            ...masjid,
            prayerTimings: [res.data],
          });
        }
      } catch (err) {
        console.error("Failed to load timings", err);
      }
    }

    setFlipped(next);
    onFlipChange?.(next, masjid);
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
          <MasjidCardBack masjid={masjid} />
        </div>
      </div>
    </div>
  );
}
