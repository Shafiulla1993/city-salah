// src/components/masjid/MasjidCardLite.js

import Link from "next/link";

export default function MasjidCardLite({ masjid }) {
  const { name, slug, cityName, areaName, imageThumbUrl } = masjid;

  return (
    <Link
      href={`/masjid/${slug}-${masjid._id}`}
      className="block rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
    >
      {/* IMAGE */}
      <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={imageThumbUrl || "/Default_Image.png"}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {name}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {areaName ? `${areaName}, ` : ""}
          {cityName}
        </p>
      </div>
    </Link>
  );
}
