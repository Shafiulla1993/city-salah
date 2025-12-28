// src/app/qibla/QiblaSkeleton.js

import Skeleton from "@/components/ui/Skeleton";

export default function QiblaSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <Skeleton className="w-80 h-80 rounded-full" />
      <Skeleton className="w-44 h-4" />
    </div>
  );
}
