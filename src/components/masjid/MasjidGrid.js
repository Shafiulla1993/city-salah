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
            gap-10
            w-full
            grid-cols-[repeat(auto-fill,minmax(380px,1fr))]
            xl:grid-cols-[repeat(auto-fill,minmax(420px,1fr))]
          "
        >
          {masjids.map((m) => (
            <div key={m._id} className="overflow-visible">
              <MasjidCard masjid={m} onExpand={onExpand} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
