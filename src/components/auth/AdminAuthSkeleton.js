"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function AdminAuthSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      {/* Page Title Placeholder */}
      <Skeleton className="h-6 w-48" />

      {/* Several block lines representing content */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
