// src/app/dashboard/super-admin/manage/modules/areas/AreasTable.js
"use client";

import { useState } from "react";
import EditAreaModal from "./EditAreaModal";
import DeleteAreaModal from "./DeleteAreaModal";

export default function AreasTable({ areas, onAreaUpdated, onAreaDeleted }) {
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-200/70 text-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Area Name</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Coordinates</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {areas.map((a) => (
              <tr key={a._id} className="hover:bg-slate-100 transition">
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3">{a.city?.name ?? "-"}</td>
                <td className="px-4 py-3">
                  {a.center?.coordinates
                    ? `${a.center.coordinates[1]}, ${a.center.coordinates[0]}`
                    : "-"}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() => setEditId(a._id)}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    onClick={() => setDelId(a._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <EditAreaModal
        open={!!editId}
        areaId={editId}
        onClose={() => setEditId(null)}
        onUpdated={(updated) => {
          onAreaUpdated?.(updated);
          setEditId(null);
        }}
      />

      <DeleteAreaModal
        open={!!delId}
        areaId={delId}
        onClose={() => setDelId(null)}
        onDeleted={(id) => {
          onAreaDeleted?.(id);
          setDelId(null);
        }}
      />
    </div>
  );
}
