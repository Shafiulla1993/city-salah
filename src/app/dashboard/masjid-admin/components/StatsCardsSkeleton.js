// src/app/dashboard/masjid-admin/components/skeletons/StatsCardsSkeleton.js

"use client";

export default function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/70 animate-pulse rounded-xl p-4 h-24"
        />
      ))}
    </div>
  );
}
