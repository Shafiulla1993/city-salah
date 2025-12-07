// src/app/dashboard/super-admin/manage/modules/thoughts/ThoughtsTable.js
"use client";

export default function ThoughtsTable({ thoughts = [], onEdit, onDelete }) {
  if (!thoughts.length)
    return <p className="text-center text-gray-500 py-6">No thoughts found.</p>;

  return (
    <div className="rounded-xl border shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-200/70 text-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Text</th>
            <th className="px-4 py-3 text-left">Images</th>
            <th className="px-4 py-3 text-left">Date Range</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {thoughts.map((t) => (
            <tr key={t._id} className="hover:bg-slate-100 transition">
              <td className="px-4 py-3 max-w-[400px]">
                <span className="line-clamp-2">{t.text}</span>
              </td>

              <td className="px-4 py-3">
                {t.images?.length ? `${t.images.length} image(s)` : "—"}
              </td>

              <td className="px-4 py-3">
                {new Date(t.startDate).toLocaleDateString()}
                {" — "}
                {new Date(t.endDate).toLocaleDateString()}
              </td>

              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(t._id)}
                  className="px-3 py-1 rounded bg-slate-700 text-white text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(t._id)}
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs"
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
