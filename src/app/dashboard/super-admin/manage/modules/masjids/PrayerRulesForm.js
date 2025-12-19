// src/app/dashboard/super-admin/manage/modules/masjids/PrayerRulesForm.js

"use client";

import { useEffect, useState } from "react";

const PRAYERS = ["fajr", "zohar", "asr", "isha", "maghrib", "juma"];

export default function PrayerRulesForm({ value = {}, onChange }) {
  const [rules, setRules] = useState({});

  useEffect(() => {
    setRules(value || {});
  }, [value]);

  function update(prayer, field, fieldValue) {
    const prev = rules[prayer] || {};
    const nextPrayer = { ...prev, [field]: fieldValue };

    // ❌ if all fields empty → remove prayer
    const hasValue = Object.values(nextPrayer).some(
      (v) => v !== "" && v !== null && v !== undefined
    );

    const next = { ...rules };

    if (!hasValue) {
      delete next[prayer];
    } else {
      next[prayer] = nextPrayer;
    }

    setRules(next);
    onChange?.(next);
  }

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-slate-50">
      <h3 className="font-semibold text-slate-700">
        Prayer Timings (Optional)
      </h3>

      {PRAYERS.map((p) => (
        <div key={p} className="space-y-2">
          <div className="font-medium capitalize">{p}</div>

          {p === "maghrib" ? (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Azan offset (min)"
                value={rules.maghrib?.azanOffset ?? ""}
                onChange={(e) =>
                  update("maghrib", "azanOffset", Number(e.target.value))
                }
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="number"
                placeholder="Iqaamat offset (min)"
                value={rules.maghrib?.iqaamatOffset ?? ""}
                onChange={(e) =>
                  update("maghrib", "iqaamatOffset", Number(e.target.value))
                }
                className="border px-3 py-2 rounded-lg"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Azan (e.g. 5 or 5:30)"
                value={rules[p]?.azan || ""}
                onChange={(e) => update(p, "azan", e.target.value)}
                className="border px-3 py-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Iqaamat"
                value={rules[p]?.iqaamat || ""}
                onChange={(e) => update(p, "iqaamat", e.target.value)}
                className="border px-3 py-2 rounded-lg"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
