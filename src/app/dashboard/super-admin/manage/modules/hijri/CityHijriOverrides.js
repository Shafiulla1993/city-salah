// src/app/dashboard/super-admin/manage/modules/hijri/CityHijriOverrides.js

"use client";

import { useState } from "react";
import { notify } from "@/lib/toast";
import AddCityHijriModal from "./AddCityHijriModal";

export default function CityHijriOverrides({ settings = [], onChange }) {
  const [open, setOpen] = useState(false);

  const cityRows = Array.isArray(settings)
    ? settings.filter((s) => s.scope === "city")
    : [];

  async function remove(id) {
    if (!confirm("Remove city override?")) return;

    const res = await fetch(`/api/super-admin/hijri-settings/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json();
    if (json.success) {
      notify.success("Override removed");
      onChange();
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">City Overrides</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1.5 rounded bg-slate-700 text-white text-sm"
        >
          + Add City Override
        </button>
      </div>

      {!cityRows.length && (
        <p className="text-sm text-gray-500">No city overrides configured.</p>
      )}

      {cityRows.length > 0 && (
        <table className="w-full text-sm border rounded">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">City</th>
              <th className="px-3 py-2 text-left">Offset</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cityRows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-3 py-2">{r.city?.name}</td>
                <td className="px-3 py-2">
                  {r.hijriOffset > 0 ? `+${r.hijriOffset}` : r.hijriOffset}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => remove(r._id)}
                    className="text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddCityHijriModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={onChange}
      />
    </div>
  );
}
