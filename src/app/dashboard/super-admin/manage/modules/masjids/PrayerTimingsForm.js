// src/app/dashboard/super-admin/manage/modules/masjids/PrayerTimingsForm.js
"use client";

export default function PrayerTimingsForm({ value = {}, onChange }) {
  const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

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

  // Validate AM/PM time format
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

  function formatTime(input) {
    // allow empty input while typing
    if (!input.trim()) return input;
    // only auto-format if valid AM/PM
    if (timeRegex.test(input)) return input.toUpperCase().replace(/\s+/g, " ");
    return input; // let user continue typing freely
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
            placeholder="e.g. 5:45 AM"
            className="border px-3 py-2 rounded-lg"
            onChange={(e) =>
              updatePrayer(p, "azan", formatTime(e.target.value))
            }
          />

          <input
            type="text"
            value={value[p]?.iqaamat || ""}
            placeholder="e.g. 6:00 AM"
            className="border px-3 py-2 rounded-lg"
            onChange={(e) =>
              updatePrayer(p, "iqaamat", formatTime(e.target.value))
            }
          />
        </div>
      ))}
    </div>
  );
}
