// src/app/dashboard/masjid-admin/manage/modules/masjids/MasjidsSkeleton.js

"use client";

export default function MasjidsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
