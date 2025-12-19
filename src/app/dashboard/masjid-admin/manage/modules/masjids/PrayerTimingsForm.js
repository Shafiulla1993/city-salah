// src/app/dashboard/masjid-admin/manage/modules/masjids/PrayerTimingsForm.js
"use client";

const PRAYERS = ["fajr", "zohar", "asr", "isha", "maghrib", "juma"];

export default function PrayerTimingsForm({ value = {}, onChange }) {
  function update(prayer, field, val) {
    const next = { ...value, [prayer]: { ...value[prayer], [field]: val } };
    onChange(next);
  }

  return (
    <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
      <h3 className="font-semibold">Prayer Timings</h3>

      {PRAYERS.map((p) => (
        <div key={p} className="space-y-2">
          <div className="capitalize font-medium">{p}</div>

          {p === "maghrib" ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Azan offset (min)"
                value={value[p]?.azanOffset ?? ""}
                onChange={(e) => update(p, "azanOffset", e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Iqaamat offset (min)"
                value={value[p]?.iqaamatOffset ?? ""}
                onChange={(e) => update(p, "iqaamatOffset", e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Azan"
                value={value[p]?.azan || ""}
                onChange={(e) => update(p, "azan", e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <input
                placeholder="Iqaamat"
                value={value[p]?.iqaamat || ""}
                onChange={(e) => update(p, "iqaamat", e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
