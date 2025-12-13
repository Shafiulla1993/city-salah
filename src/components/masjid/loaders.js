// src/components/masjid/loaders.js
"use client";

import Skeleton from "@/components/ui/Skeleton";

/* ===============================
   FRONT CARD SKELETON
================================ */
export function MasjidCardSkeleton() {
  return (
    <div
      className="relative w-full max-w-[420px] mx-auto rounded-2xl bg-white overflow-hidden shadow"
      style={{ height: "82vh" }}
    >
      {/* Header */}
      <div className="h-[10%] flex items-center justify-between px-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Image */}
      <div className="h-[70%] flex items-center justify-center bg-slate-100">
        <Skeleton className="h-[90%] w-[90%] rounded-xl" />
      </div>

      {/* Bottom */}
      <div className="h-[20%] px-4 py-3 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        <Skeleton className="w-14 h-14 rounded-full" />
      </div>
    </div>
  );
}

/* ===============================
   BACK CARD SKELETON
================================ */
export function MasjidCardBackSkeleton() {
  return (
    <div className="w-full h-full p-4 bg-white rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Prayer Timings */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 border rounded-xl space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Contacts */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// 🔹 Auqatus Timings Skeleton Loader
export function AuqatusTimingsLoader() {
  return (
    <div className="bg-white shadow rounded-lg p-4 animate-pulse">
      {/* Title */}
      <Skeleton className="h-7 w-56 mx-auto mb-6" />

      {/* Rows */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-4 py-2 border-b last:border-none"
          >
            <Skeleton className="h-5 w-24 mx-auto" />
            <Skeleton className="h-5 w-20 mx-auto" />
            <Skeleton className="h-5 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
