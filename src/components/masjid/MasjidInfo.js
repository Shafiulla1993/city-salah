// src/components/RightPanel/MasjidInfo.js
"use client";

import React from "react";
import Image from "next/image";

export default function MasjidInfo({ masjid }) {
  if (!masjid) return null;

  const defaultImage = "/Default_Image.png";

  const imageSrc = masjid.imageUrl
    ? masjid.imageUrl.startsWith("http")
      ? masjid.imageUrl
      : `/uploads/masjids/${masjid.imageUrl}`
    : defaultImage;

  const altText = masjid?.name ? `Photo of ${masjid.name}` : "Masjid image";

  return (
    <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6">
      <h2 className="text-2xl font-bold mb-3 text-slate-800 tracking-wide">
        Masjid
      </h2>
      {/* BIG IMAGE, FULL WIDTH, NOT CROPPED */}
      <div className="relative w-full h-[350px] sm:h-[380px] md:h-[420px] lg:h-[450px] mb-4 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
        <Image
          src={imageSrc}
          alt={altText}
          fill
          className="object-contain rounded-md"
          priority
          unoptimized
        />
      </div>

      <h2 className="text-2xl font-bold">{masjid.name}</h2>

      {masjid.address && <p className="text-gray-600 mt-1">{masjid.address}</p>}

      {masjid.area?.name && (
        <p className="text-gray-700 text-sm mt-1">Area: {masjid.area.name}</p>
      )}

      {masjid.city?.name && (
        <p className="text-gray-700 text-sm">City: {masjid.city.name}</p>
      )}
    </div>
  );
}
