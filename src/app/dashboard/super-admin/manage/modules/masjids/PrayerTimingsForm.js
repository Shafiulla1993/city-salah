// src/app/dashboard/super-admin/manage/modules/masjids/PrayerTimingsForm.js
"use client";

export default function PrayerTimingsForm({ value = {}, onChange }) {
  const prayers = ["fajr", "Zohar", "asr", "maghrib", "isha"];

  function updatePrayer(prayer, field, fieldValue) {
    const updated = {
      ...value,
      [prayer]: {
        ...value[prayer],
        [field]: fieldValue, // raw value only
      },
    };
    onChange(updated);
  }

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
      <h3 className="text-sm font-semibold text-slate-700">Prayer Timings</h3>

      {prayers.map((p) => (
        <div
          key={p}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
        >
          <div className="capitalize font-medium">{p}</div>

          <input
            type="text"
            value={value[p]?.azan || ""}
            placeholder="Azaan e.g. 5:30"
            className="border px-3 py-2 rounded-lg"
            onChange={(e) => updatePrayer(p, "azan", e.target.value)}
          />

          <input
            type="text"
            value={value[p]?.iqaamat || ""}
            placeholder="Iqaamat e.g. 5:45"
            className="border px-3 py-2 rounded-lg"
            onChange={(e) => updatePrayer(p, "iqaamat", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
