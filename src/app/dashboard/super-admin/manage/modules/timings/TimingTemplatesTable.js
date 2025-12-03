// src/app/dashboard/super-admin/manage/modules/timings/TimingTemplatesTable.js

"use client";

export default function TimingTemplatesTable({ templates, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/40 shadow">
      <table className="w-full text-sm">
        <thead className="bg-slate-200/70 text-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Timezone</th>
            <th className="px-4 py-3 text-left">Recurrence</th>
            <th className="px-4 py-3 text-left">Year</th>
            <th className="px-4 py-3 text-left">Days</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {templates.map((t) => (
            <tr key={t._id} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3">{t.name}</td>
              <td className="px-4 py-3">{t.timezone || "Asia/Kolkata"}</td>
              <td className="px-4 py-3 capitalize">
                {t.recurrence || "recurring"}
              </td>
              <td className="px-4 py-3">{t.year || "-"}</td>
              <td className="px-4 py-3">{t.days?.length ?? 0}</td>

              <td className="px-4 py-3 text-right space-x-2">
                <button
                  className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                  onClick={() => onEdit?.(t._id)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                  onClick={() => onDelete?.(t._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {!templates.length && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-gray-500 text-sm"
              >
                No templates yet. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
