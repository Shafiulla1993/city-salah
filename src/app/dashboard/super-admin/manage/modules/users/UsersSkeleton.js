"use client";

export default function UsersSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-3">
      <div className="animate-pulse bg-white/70 rounded-xl p-6 h-12" />
      <div className="overflow-hidden rounded-xl border border-white/40">
        <div className="p-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="animate-pulse h-10 bg-white/70 rounded my-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
