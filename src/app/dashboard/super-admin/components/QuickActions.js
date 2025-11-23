
// src/app/dashboard/super-admin/components/QuickActions.js

"use client";

import { useRouter } from "next/navigation";
import AdminButton from "@/components/admin/AdminButton";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    { key: "manage", label: "Manage Data", path: "/dashboard/super-admin/manage" },
    { key: "generate", label: "Generate Today Timings", path: "/dashboard/super-admin/prayer-timings" },
    { key: "create-ann", label: "New Announcement", path: "/dashboard/super-admin/announcements/create" },
  ];

  return (
    <div className="bg-white/90 rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3 text-slate-800">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <AdminButton key={a.key} onClick={() => router.push(a.path)}>
            {a.label}
          </AdminButton>
        ))}
      </div>
    </div>
  );
}
