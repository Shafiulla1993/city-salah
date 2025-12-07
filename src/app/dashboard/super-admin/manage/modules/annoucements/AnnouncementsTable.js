// src/app/dashboard/super-admin/manage/modules/announcements/AnnouncementsTable.js
// src/app/dashboard/super-admin/manage/modules/announcements/AnnouncementsTable.js
"use client";

export default function AnnouncementsTable({
  announcements = [],
  onEdit,
  onDelete,
}) {
  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!announcements.length) {
    return (
      <p className="text-gray-500 text-sm text-center py-6">
        No announcements found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Date Range</th>
            <th className="px-4 py-3 text-left">Targets</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {announcements.map((a) => {
            const start = formatDate(a.startDate);
            const end = formatDate(a.endDate);

            const citiesCount = a.cities?.length || 0;
            const areasCount = a.areas?.length || 0;
            const masjidsCount = a.masjids?.length || 0;

            const now = new Date();
            const isActive =
              new Date(a.startDate) <= now && new Date(a.endDate) >= now;
            const isUpcoming = new Date(a.startDate) > now;
            const isExpired = new Date(a.endDate) < now;

            let badge = {
              text: "Inactive",
              class: "bg-gray-200 text-gray-600",
            };
            if (isActive)
              badge = { text: "Active", class: "bg-green-100 text-green-700" };
            if (isUpcoming)
              badge = { text: "Upcoming", class: "bg-blue-100 text-blue-700" };
            if (isExpired)
              badge = { text: "Expired", class: "bg-red-100 text-red-700" };

            return (
              <tr key={a._id} className="hover:bg-slate-50 transition">
                {/* TITLE + BODY */}
                <td className="px-4 py-3 max-w-xs align-top">
                  <div className="font-medium text-slate-800 line-clamp-2">
                    {a.title}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {a.body}
                  </div>

                  {a.images?.length > 0 && (
                    <span className="mt-2 inline-flex px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">
                      {a.images.length} image{a.images.length > 1 ? "s" : ""}
                    </span>
                  )}
                </td>

                {/* DATES */}
                <td className="px-4 py-3 whitespace-nowrap align-top">
                  <div className="font-medium">{start}</div>
                  <div className="text-xs text-gray-500 text-center leading-none">
                    to
                  </div>
                  <div className="font-medium">{end}</div>
                </td>

                {/* TARGETS */}
                <td className="px-4 py-3 text-xs text-gray-700 align-top">
                  <div>{citiesCount} city(ies)</div>
                  <div>{areasCount} area(s)</div>
                  <div>{masjidsCount} masjid(s)</div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3 text-center align-top">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}
                  >
                    {badge.text}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3 text-right space-x-2 align-top">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() => onEdit?.(a._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    onClick={() => onDelete?.(a._id)}
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
