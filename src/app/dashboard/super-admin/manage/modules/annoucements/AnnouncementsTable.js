// src/app/dashboard/super-admin/manage/modules/announcements/AnnouncementsTable.js
"use client";

export default function AnnouncementsTable({
  announcements,
  onEdit,
  onDelete,
}) {
  if (!announcements.length) {
    return (
      <p className="text-gray-500 text-sm text-center">No announcements</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-slate-200">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Date Range</th>
            <th className="px-4 py-3 text-left">Targets</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {announcements.map((a) => (
            <tr key={a._id}>
              <td className="px-4 py-2">{a.title}</td>
              <td className="px-4 py-2">
                {new Date(a.startDate).toLocaleDateString()} –{" "}
                {new Date(a.endDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-xs">
                {a.cities?.length || 0} Cities, {a.areas?.length || 0} Areas,{" "}
                {a.masjids?.length || 0} Masjids
              </td>
              <td className="px-4 py-2">{a.status}</td>
              <td className="px-4 py-2 text-right space-x-2">
                <button
                  className="px-3 py-1 bg-slate-700 text-white rounded text-xs"
                  onClick={() => onEdit(a._id)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs"
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
