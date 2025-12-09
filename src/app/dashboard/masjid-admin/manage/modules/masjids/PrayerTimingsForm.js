// src/app/dashboard/masjid-admin/manage/modules/masjids/PrayerTimingsForm.js

"use client";

export default function PrayerTimingsForm({ value = {}, onChange }) {
  const prayers = ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"];

  function update(prayer, field, fieldValue) {
    const updated = {
      ...value,
      [prayer]: {
        ...value[prayer],
        [field]: fieldValue,
      },
    };
    onChange(updated);
  }

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
      <h3 className="text-sm font-semibold text-slate-700">
        Prayer Timings (Azaan / Iqaamat)
      </h3>

      {prayers.map((p) => (
        <div
          key={p}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
        >
          <div className="capitalize font-medium">{p}</div>

          <input
            type="text"
            className="border px-3 py-2 rounded-lg"
            placeholder="Azaan e.g. 5:30"
            value={value[p]?.azan || ""}
            onChange={(e) => update(p, "azan", e.target.value)}
          />

          <input
            type="text"
            className="border px-3 py-2 rounded-lg"
            placeholder="Iqaamat e.g. 5:45"
            value={value[p]?.iqaamat || ""}
            onChange={(e) => update(p, "iqaamat", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
