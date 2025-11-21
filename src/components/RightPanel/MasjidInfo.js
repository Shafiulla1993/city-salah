"use client";
import React from "react";
import Image from "next/image";

export default function MasjidInfo({ masjid }) {
  if (!masjid) return null;

  const defaultImage = "/Default_Image.png"; // adjust if needed

  const imageSrc = masjid.imageUrl
    ? masjid.imageUrl.startsWith("http")
      ? masjid.imageUrl
      : `/uploads/masjids/${masjid.imageUrl}`
    : defaultImage;

  return (
    <div className="bg-white shadow rounded p-4">
      {/* Responsive image wrapper */}
      <div className="relative mb-4 h-40 sm:h-48 md:h-56 lg:h-64 w-full">
        <Image
          src={imageSrc}
          alt={masjid.name}
          fill
          className="object-cover rounded"
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
