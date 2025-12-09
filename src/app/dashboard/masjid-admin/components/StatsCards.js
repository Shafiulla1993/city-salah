// src/app/dashboard/masjid-admin/components/StatsCards.js

"use client";

export default function StatsCards({ stats = {} }) {
  const cards = [
    { label: "Announcements", value: stats?.announcementsCount ?? 0 },
    { label: "Pending Expiry", value: stats?.expiringSoonCount ?? 0 },
    { label: "Contacts", value: stats?.contactsCount ?? 0 },
    {
      label: "Prayer Timings Updated",
      value: stats?.timingsUpdated ? "Yes" : "No",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white/90 p-4 rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">{c.label}</p>
          <p className="text-2xl font-bold mt-1 text-slate-800">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
