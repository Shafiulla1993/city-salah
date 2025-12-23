// src/app/dashboard/super-admin/manage/modules/masjids/PrayerRulesForm.js

"use client";

import { useEffect, useState } from "react";

const MANUAL_PRAYERS = ["fajr", "zohar", "asr", "isha", "juma"];
const AUTO_PRAYERS = ["maghrib"];

export default function PrayerRulesForm({ value = {}, onChange }) {
  const [rules, setRules] = useState({});

  useEffect(() => {
    setRules(value || {});
  }, [value]);

  function updateManual(prayer, field, v) {
    const next = {
      ...rules,
      [prayer]: {
        mode: "manual",
        manual: {
          ...(rules[prayer]?.manual || {}),
          [field]: v,
        },
      },
    };

    setRules(next);
    onChange?.(next);
  }

  function updateAuto(prayer, field, v) {
    const next = {
      ...rules,
      [prayer]: {
        mode: "auto",
        auto: {
          source: "auqatus_salah",
          ...(rules[prayer]?.auto || {}),
          [field]: Number(v),
        },
      },
    };

    setRules(next);
    onChange?.(next);
  }

  return (
    <div className="border rounded-xl p-4 space-y-5 bg-slate-50">
      <h3 className="font-semibold text-slate-700">Prayer Rules</h3>

      {/* MANUAL PRAYERS */}
      {MANUAL_PRAYERS.map((p) => {
        const rule = rules[p] || {};

        return (
          <div key={p} className="space-y-2">
            <div className="font-medium capitalize">{p}</div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Azan (e.g. 5:30)"
                value={rule.manual?.azan || ""}
                onChange={(e) => updateManual(p, "azan", e.target.value)}
                className="border px-3 py-2 rounded-lg"
              />

              <input
                type="text"
                placeholder="Iqaamat (e.g. 5:45)"
                value={rule.manual?.iqaamat || ""}
                onChange={(e) => updateManual(p, "iqaamat", e.target.value)}
                className="border px-3 py-2 rounded-lg"
              />
            </div>
          </div>
        );
      })}

      {/* AUTO MAGHRIB */}
      <div className="space-y-2 border-t pt-4">
        <div className="font-medium capitalize">Maghrib</div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Azan offset (min)"
            value={rules.maghrib?.auto?.azan_offset_minutes ?? ""}
            onChange={(e) =>
              updateAuto("maghrib", "azan_offset_minutes", e.target.value)
            }
            className="border px-3 py-2 rounded-lg"
          />

          <input
            type="number"
            placeholder="Iqaamat offset (min)"
            value={rules.maghrib?.auto?.iqaamat_offset_minutes ?? ""}
            onChange={(e) =>
              updateAuto("maghrib", "iqaamat_offset_minutes", e.target.value)
            }
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        <p className="text-xs text-slate-500">
          Maghrib timings are auto-synced from Auqatus Salah
        </p>
      </div>
    </div>
  );
}
