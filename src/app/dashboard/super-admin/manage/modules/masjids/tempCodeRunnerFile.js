// src/app/dashboard/super-admin/manage/modules/masjids/PrayerTimingsForm.js

"use client";

export default function PrayerTimingsForm({ value = {}, onChange }) {
  const prayers = ["fajr", "zohar", "asr", "maghrib", "isha", "juma"];

  function updatePrayer(prayer, field, fieldValue) {
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
      <h3 className="text-sm font-semibold text-slate-700">Prayer Timings</h3>

      {prayers.map((p) => (
        <div
          key={p}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
        >
          <div className="capitalize font-medium">{p}</div>

          <input
            type="time"
            value={value[p]?.azan || ""}
            onChange={(e) => updatePrayer(p, "azan", e.target.value)}
            className="border px-3 py-2 rounded-lg"
            placeholder="Azan"
          />

          <input
            type="time"
            value={value[p]?.iqaamat || ""}
            onChange={(e) => updatePrayer(p, "iqaamat", e.target.value)}
            className="border px-3 py-2 rounded-lg"
            placeholder="Iqaamat"
          />
        </div>
      ))}
    </div>
  );
}
