// src/components/RightPanel/loaders

import Skeleton from "@/components/ui/Skeleton";

// 🔹 Announcement Box Loader
export function AnnouncementBoxSkeleton() {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <Skeleton className="h-6 w-1/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// 🔹 Contact Info Loader
export function ContactInfoLoader() {
  return (
    <div className="bg-white shadow rounded p-4">
      <Skeleton className="h-6 w-32 mb-4" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-5 w-2/3 mb-1" />
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 🔹 Masjid Info Loader
export function MasjidInfoLoader() {
  return (
    <div className="bg-white shadow rounded p-4 animate-pulse space-y-4">
      <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-slate-300 rounded"></div>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

// 🔹 Prayer Timings Loader
export function PrayerTimingsLoader() {
  return (
    <div className="bg-white shadow rounded p-4">
      <Skeleton className="h-6 w-40 mb-4" />

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

//🔹 AuqatusTimingsLoader

export default function AuqatusTimingsLoader() {
  return (
    <div className="bg-white shadow rounded-lg p-4 animate-pulse">
      <Skeleton className="h-7 w-56 mx-auto mb-6" />

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
