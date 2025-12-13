// src/components/masjid/MasjidGrid.js

"use client";

import React from "react";
import MasjidCard from "./MasjidCard";
import MobileCarousel from "./MobileCarousel";

export default function MasjidGrid({ masjids = [], onExpand }) {
  if (!Array.isArray(masjids)) masjids = [];

  return (
    <>
      {/* MOBILE VIEW — CAROUSEL */}
      <div className="block lg:hidden">
        <MobileCarousel masjids={masjids} onExpand={onExpand} />
      </div>

      {/* DESKTOP GRID */}
      <div className="hidden lg:block w-full">
        <div
          className="
      grid
      mx-auto
      justify-center
      gap-6
      grid-cols-[repeat(auto-fit,minmax(320px,1fr))]
      xl:grid-cols-[repeat(auto-fit,minmax(360px,1fr))]
      max-w-[1280px]
    "
        >
          {masjids.map((m) => (
            <div key={m._id} className="flex justify-center">
              <MasjidCard masjid={m} onExpand={onExpand} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
