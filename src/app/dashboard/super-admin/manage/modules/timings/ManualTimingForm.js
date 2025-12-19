// src/app/dashboard/super-admin/manage/modules/timings/ManualTimingForm.js

"use client";

export default function ManualTimingForm({ value = {}, onChange }) {
  const fields = [
    { key: "sehri_end", label: "Sehri End" },
    { key: "fajr_start", label: "Fajr Start" },
    { key: "fajr_end", label: "Fajr End" },
    { key: "makrooh_start", label: "Makrooh Start" },
    { key: "makrooh_end", label: "Makrooh End" },
    { key: "ishraq_start", label: "Ishraq Start" },
    { key: "ishraq_end", label: "Ishraq End" },
    { key: "chasht_start", label: "Chasht Start" },
    { key: "chasht_end", label: "Chasht End" },
    { key: "zawaal_start", label: "Zawaal Start" },
    { key: "zawaal_end", label: "Zawaal End" },
    { key: "zohar_start", label: "zohar Start" },
    { key: "zohar_end", label: "zohar End" },
    { key: "asar_shafi_start", label: "Asar Shafi Start" },
    { key: "asar_shafi_end", label: "Asar Shafi End" },
    { key: "asar_hanafi_start", label: "Asar Hanafi Start" },
    { key: "asar_hanafi_end", label: "Asar Hanafi End" },
    { key: "maghrib_start", label: "Maghrib Start" },
    { key: "maghrib_end", label: "Maghrib End" },
    { key: "isha_start", label: "Isha Start" },
    { key: "isha_end", label: "Isha End" },
  ];

  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

  function formatTime(input) {
    if (!input.trim()) return input;
    if (timeRegex.test(input)) {
      return input.toUpperCase().replace(/\s+/g, " ");
    }
    return input;
  }

  function updateField(key, newValue) {
    const formatted = formatTime(newValue);
    onChange({
      ...value,
      [key]: formatted,
    });
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left w-1/3">Timing</th>
            <th className="px-3 py-2 text-left">Time (HH:MM AM/PM)</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {fields.map((f) => (
            <tr key={f.key}>
              <td className="px-3 py-2 text-slate-800">{f.label}</td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  className="border px-3 py-1.5 rounded w-full"
                  placeholder="e.g. 5:45 AM"
                  value={value[f.key] || ""}
                  onChange={(e) => updateField(f.key, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-gray-500 px-3 py-2">
        Format: <code>5:45 AM</code> or <code>6:05 PM</code>. Empty fields are
        allowed.
      </p>
    </div>
  );
}
