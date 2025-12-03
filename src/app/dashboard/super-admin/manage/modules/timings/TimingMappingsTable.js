// src/app/dashboard/super-admin/manage/modules/timings/TimingMappingsTable.js

"use client";

export default function TimingMappingsTable({
  mappings,
  cities,
  areas,
  filteredAreas,
  onDelete,
}) {
  const findCityName = (id) => cities.find((c) => c._id === id)?.name || "-";
  const findAreaName = (id) => areas.find((a) => a._id === id)?.name || "-";

  return (
    <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
      <table className="w-full text-sm">
        <thead className="bg-slate-200/70 text-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Scope</th>
            <th className="px-4 py-3 text-left">Target</th>
            <th className="px-4 py-3 text-left">Template</th>
            <th className="px-4 py-3 text-left">Global Offset (min)</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mappings.map((m) => (
            <tr key={m._id} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3 capitalize">{m.scope}</td>
              <td className="px-4 py-3">
                {m.scope === "city"
                  ? m.city?.name || findCityName(m.city)
                  : m.area?.name || findAreaName(m.area)}
              </td>
              <td className="px-4 py-3">{m.template?.name || "-"}</td>
              <td className="px-4 py-3">{m.offsets?.global ?? 0}</td>
              <td className="px-4 py-3 text-right">
                <button
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                  onClick={() => onDelete?.(m._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {!mappings.length && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-gray-500 text-sm"
              >
                No mappings yet. Create a mapping to attach a template to a city
                or area.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
