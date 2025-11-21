import Skeleton from "@/components/ui/Skeleton";

export default function ContactInfoSkeleton() {
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
