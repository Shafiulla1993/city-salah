// src/app/dashboard/super-admin/components/skeleton/AdminTableSkeleton.js

"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function AdminTableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-4 w-full overflow-hidden">
      {/* Table Header */}
      <Skeleton className="h-6 w-40 mb-4" />

      {/* Table Rows */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 items-center border-b pb-2"
          >
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
