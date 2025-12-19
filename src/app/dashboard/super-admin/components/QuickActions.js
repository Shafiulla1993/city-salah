// src/app/dashboard/super-admin/components/QuickActions.js
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import SyncMaghribModal from "./SyncMaghribModal";

export default function QuickActions() {
  const router = useRouter();
  const [openSyncModal, setOpenSyncModal] = useState(false);

  const actions = [
    {
      key: "manage",
      label: "Manage Data",
      onClick: () => router.push("/dashboard/super-admin/manage"),
    },
    {
      key: "create-ann",
      label: "New Announcement",
      onClick: () => router.push("/dashboard/super-admin/announcements/create"),
    },
  ];

  return (
    <>
      <div className="bg-white/90 rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3 text-slate-800">Quick Actions</h3>

        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <AdminButton key={a.key} onClick={a.onClick}>
              {a.label}
            </AdminButton>
          ))}

          <AdminButton
            onClick={() => setOpenSyncModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Sync Maghrib Timings
          </AdminButton>
        </div>
      </div>

      {/* Modal */}
      <SyncMaghribModal
        open={openSyncModal}
        onClose={() => setOpenSyncModal(false)}
      />
    </>
  );
}
