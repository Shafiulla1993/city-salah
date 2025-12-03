// src/app/dashboard/super-admin/manage/modules/timings/TimingsSkeleton.js

export default function TimingsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-slate-200 rounded" />
      ))}
    </div>
  );
}
