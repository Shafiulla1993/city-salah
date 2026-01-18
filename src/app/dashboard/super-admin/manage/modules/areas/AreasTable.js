// src/app/dashboard/super-admin/manage/modules/areas/AreasTable.js
// src/app/dashboard/super-admin/manage/modules/areas/AreasTable.js
"use client";

export default function AreasTable({ areas, onEdit, onDelete }) {
  return (
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
                  onClick={() => onEdit(a._id)}
                >
                  Edit
                </button>

                <button
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                  onClick={() => onDelete(a._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
