// src/components/masjid/MasjidCardBack.js
"use client";

import React, { useEffect } from "react";

function PrayerCard({ title, time1, time2 }) {
  return (
    <div className="p-3 bg-white rounded-xl border shadow-sm">
      <div className="font-semibold text-slate-800">{title}</div>
      <div className="text-sm text-slate-600">Azaan: {time1 || "--"}</div>
      <div className="text-sm text-slate-600">Iqaamat: {time2 || "--"}</div>
    </div>
  );
}

export default function MasjidCardBack({ masjid }) {
  const full = masjid.fullDetails || {};
  const timings = full.prayerTimings || masjid.prayerTimings?.[0] || {};
  const contacts = full.contacts || [];

  // SEO update
  useEffect(() => {
    document.title = `${masjid.name} – ${masjid.area?.name}, ${masjid.city?.name} | Prayer Timings`;
  }, [masjid]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto overscroll-contain bg-white rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg">{masjid.name}</div>
        <div className="text-sm text-slate-500 text-right">
          {masjid.area?.name}
          <br />
          {masjid.city?.name}
        </div>
      </div>

      {/* Namaz Timings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <PrayerCard
          title="Fajr"
          time1={timings.fajr?.azan}
          time2={timings.fajr?.iqaamat}
        />
        <PrayerCard
          title="Zohar"
          time1={timings.Zohar?.azan}
          time2={timings.Zohar?.iqaamat}
        />
        <PrayerCard
          title="Asr"
          time1={timings.asr?.azan}
          time2={timings.asr?.iqaamat}
        />
        <PrayerCard
          title="Maghrib"
          time1={timings.maghrib?.azan}
          time2={timings.maghrib?.iqaamat}
        />
        <PrayerCard
          title="Isha"
          time1={timings.isha?.azan}
          time2={timings.isha?.iqaamat}
        />
        <PrayerCard
          title="Juma"
          time1={timings.juma?.azan}
          time2={timings.juma?.iqaamat}
        />
      </div>

      {/* Contacts */}
      <div className="mb-4">
        <div className="font-semibold text-slate-800 mb-2">Contacts</div>

        {contacts.length ? (
          contacts.map((c, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-3 border mb-2">
              <div className="font-medium capitalize">{c.role}</div>
              <div>{c.name}</div>
              {c.phone && <div>📞 {c.phone}</div>}
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">No contacts provided</div>
        )}
      </div>

      {/* Address */}
      {masjid.address && (
        <div className="bg-white border shadow-sm p-4 rounded-xl text-slate-800">
          {masjid.address}
        </div>
      )}
    </div>
  );
}
