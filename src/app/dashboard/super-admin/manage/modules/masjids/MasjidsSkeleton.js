// src/app/dashboard/super-admin/manage/modules/masjids/MasjidsSkeleton.js

export default function MasjidsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
