// src/app/dashboard/super-admin/manage/modules/thoughts/ThoughtsTable.js
"use client";

export default function ThoughtsTable({ thoughts, onEdit, onDelete }) {
  if (!thoughts.length)
    return <p className="text-center text-gray-500 py-6">No thoughts</p>;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-slate-200">
          <tr>
            <th className="px-4 py-3 text-left">Text</th>
            <th className="px-4 py-3">Dates</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {thoughts.map((t) => (
            <tr key={t._id}>
              <td className="px-4 py-2 line-clamp-2 max-w-md">{t.text}</td>
              <td className="px-4 py-2 text-xs">
                {new Date(t.startDate).toLocaleDateString()} –{" "}
                {new Date(t.endDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 capitalize">{t.status}</td>
              <td className="px-4 py-2 text-right space-x-2">
                <button
                  className="px-3 py-1 bg-slate-700 text-white rounded text-xs"
                  onClick={() => onEdit(t._id)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                  onClick={() => onDelete(t._id)}
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
