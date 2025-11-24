// File: src/app/dashboard/super-admin/manage/modules/cities/CitiesTable.js
"use client";

import React, { useState } from "react";
import EditCityModal from "./EditCityModal";
import DeleteCityModal from "./DeleteCityModal";

export default function CitiesTable({ cities = [] }) {
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);

  if (!cities.length) {
    return (
      <p className="text-gray-500 text-sm text-center py-6">No cities found.</p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-200/70 text-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Timezone</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {cities.map((c) => (
              <tr key={c._id} className="hover:bg-slate-100 transition">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.timezone || "Asia/Kolkata"}</td>
                <td className="px-4 py-3">{c.slug || "-"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() => setEditId(c._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    onClick={() => setDelId(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditCityModal
        open={!!editId}
        onClose={() => setEditId(null)}
        cityId={editId}
        onUpdated={() => setEditId(null)}
      />
      <DeleteCityModal
        open={!!delId}
        onClose={() => setDelId(null)}
        cityId={delId}
        onDeleted={() => setDelId(null)}
      />
    </div>
  );
}
