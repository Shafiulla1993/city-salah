// src/app/dashboard/super-admin/manage/modules/masjids/MasjidsTable.js
"use client";

import { useState } from "react";
import EditMasjidModal from "./EditMasjidModal";
import DeleteMasjidModal from "./DeleteMasjidModal";

export default function MasjidsTable({
  masjids = [],
  onMasjidUpdated,
  onMasjidDeleted,
}) {
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Area</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {masjids.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.address || "-"}</td>
                <td className="px-4 py-3">{m.city?.name || "-"}</td>
                <td className="px-4 py-3">{m.area?.name || "-"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() => setEditId(m._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    onClick={() => setDelId(m._id)}
                  >
                    Delete
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
        onUpdated={() => {
          onMasjidUpdated?.();
          setEditId(null);
        }}
      />

      <DeleteMasjidModal
        open={!!delId}
        masjidId={delId}
        onClose={() => setDelId(null)}
        onDeleted={() => {
          onMasjidDeleted?.();
          setDelId(null);
        }}
      />
    </div>
  );
}
