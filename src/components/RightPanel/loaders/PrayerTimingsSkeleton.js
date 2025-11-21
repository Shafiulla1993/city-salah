import Skeleton from "@/components/ui/Skeleton";

export default function PrayerTimingsSkeleton() {
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
