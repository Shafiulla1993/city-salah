// src/components/masjid/loaders.js
"use client";

import Skeleton from "@/components/ui/Skeleton";

/* ===============================
   MASJID DETAILS (MOBILE)
================================ */
export function MasjidDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="rounded-2xl bg-white/80 shadow-xl p-4">
        <div className="w-full aspect-[4/5] bg-slate-200 rounded-xl" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* NEXT PRAYER */}
      <div className="rounded-2xl bg-white/80 shadow-xl p-6 flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>

      {/* PRAYER TIMINGS */}
      <div className="rounded-2xl bg-white/80 shadow-xl p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 bg-white rounded-xl border space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* ADDRESS */}
      <div className="rounded-2xl bg-white/80 shadow-xl p-6 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* CONTACTS */}
      <div className="rounded-2xl bg-white/80 shadow-xl p-6">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===============================
   MASJID DETAILS LAYOUT (DESKTOP)
================================ */
export function MasjidDetailsLayoutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/80 shadow-xl p-4">
            <div className="w-full aspect-[4/5] bg-slate-200 rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 shadow-xl p-4 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/80 shadow-xl p-6 flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>

          <div className="rounded-2xl bg-white/80 shadow-xl p-6">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 shadow-xl p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
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

// 🔹 Auqatus Timings Skeleton Loader (Pill type location setter)
export function LocationBarSkeleton() {
  return (
    <div className="sticky top-16 z-40 w-full flex justify-center px-4">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-300 rounded-full shadow-md px-4 py-2">
        {/* pin */}
        <Skeleton className="w-4 h-4 rounded-full" />

        {/* text */}
        <Skeleton className="h-4 w-36 rounded-md" />

        {/* arrow */}
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
    </div>
  );
}
