// src/app/dashboard/masjid-admin/manage/modules/announcements/AnnouncementsTable.js

"use client";

export default function AnnouncementsTable({
  announcements = [],
  onEdit,
  onDelete,
}) {
  if (!announcements.length)
    return (
      <p className="text-center text-gray-500 py-6">No announcements found.</p>
    );

  return (
    <div className="rounded-xl border shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-200/70 text-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Body</th>
            <th className="px-4 py-3 text-left">Created / Expiry</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {announcements.map((a) => {
            const created = new Date(a.createdAt);
            const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000); // +1 day

            return (
              <tr key={a._id} className="hover:bg-slate-100 transition">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 max-w-[400px] line-clamp-2">
                  {a.body}
                </td>

                <td className="px-4 py-3">
                  {created.toLocaleString()}
                  <br />
                  <span className="text-xs text-red-700 font-medium">
                    Expires: {expires.toLocaleString()}
                  </span>
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => onEdit(a._id)}
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(a._id)}
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
