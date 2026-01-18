// src/app/dashboard/super-admin/manage/modules/masjids/MasjidsSkeleton.js
"use client";

export default function MasjidsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-200 animate-pulse rounded" />
      ))}
    </div>
  );
}
