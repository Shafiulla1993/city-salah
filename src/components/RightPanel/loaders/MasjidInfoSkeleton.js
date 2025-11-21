import Skeleton from "@/components/ui/Skeleton";

export default function MasjidInfoSkeleton() {
  return (
    <div className="bg-white shadow rounded p-4">
      {/* Image Block */}
      <Skeleton className="w-full h-40 sm:h-48 md:h-56 lg:h-64 mb-4" />

      {/* Text */}
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
