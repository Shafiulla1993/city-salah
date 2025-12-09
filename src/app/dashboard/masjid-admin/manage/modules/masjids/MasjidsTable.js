// src/app/dashboard/masjid-admin/manage/modules/masjids/MasjidsTable.js

"use client";

import { useState } from "react";
import EditMasjidModal from "./EditMasjidModal";

export default function MasjidsTable({ masjids = [], onMasjidUpdated }) {
  const [editId, setEditId] = useState(null);

  if (!masjids.length)
    return (
      <p className="text-center text-gray-500 py-6">
        No masjids assigned to your account.
      </p>
    );

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-200/70 text-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Area</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {masjids.map((m) => (
              <tr key={m._id} className="hover:bg-slate-100 transition">
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.address ?? "-"}</td>
                <td className="px-4 py-3">{m.city?.name ?? "-"}</td>
                <td className="px-4 py-3">{m.area?.name ?? "-"}</td>

                <td className="px-4 py-3 text-right">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() => setEditId(m._id)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditMasjidModal
        open={!!editId}
        masjidId={editId}
        onClose={() => setEditId(null)}
        onUpdated={(u) => {
          onMasjidUpdated?.(u);
          setEditId(null);
        }}
      />
    </div>
  );
}
