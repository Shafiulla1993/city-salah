// src/app/dashboard/super-admin/components/StatsCards.js

"use client";

export default function StatsCards({ stats = {} }) {
  const cards = [
    { label: "Users", value: stats?.usersCount ?? 0 },
    { label: "Masjids", value: stats?.masjidsCount ?? 0 },
    { label: "Announcements", value: stats?.announcementsCount ?? 0 },
    { label: "Cities", value: stats?.citiesCount ?? 0 },
    { label: "Areas", value: stats?.areasCount ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white/90 p-4 rounded-xl shadow text-center">
          <p className="text-gray-600 text-sm">{c.label}</p>
          <p className="text-2xl font-bold mt-1 text-slate-800">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
