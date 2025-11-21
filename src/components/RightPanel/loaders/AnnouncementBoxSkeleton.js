import Skeleton from "@/components/ui/Skeleton";

export default function AnnouncementBoxSkeleton() {
  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      {/* Title */}
      <Skeleton className="h-6 w-1/3 mb-3" />

      {/* Content lines */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
