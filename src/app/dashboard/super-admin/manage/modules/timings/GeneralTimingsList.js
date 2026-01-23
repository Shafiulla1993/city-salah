// src/app/dashboard/super-admin/manage/modules/GeneralTimingsList.js

"use client";

import { useEffect, useMemo, useState } from "react";
import AddManualTimingModal from "./AddManualTimingModal";

function minutesToTime(min) {
  if (min === null || min === undefined) return "-";
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function GeneralTimingsList({ cityId, areaId, month }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const dayKeys = useMemo(() => {
    if (!month) return [];
    const [year, m] = month.split("-");
    const daysInMonth = new Date(Number(year), Number(m), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = String(i + 1).padStart(2, "0");
      return `${m}-${d}`; // MM-DD
    });
  }, [month]);

  useEffect(() => {
    if (!cityId || !month) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/super-admin/general-prayer-timings?cityId=${cityId}&areaId=${areaId || ""}&month=${month}`,
          { credentials: "include" },
        );
        const json = await res.json();
        setData(json?.data || []);
      } catch (e) {
        console.error("Load timings failed:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [cityId, areaId, month]);

  const rows = dayKeys.map((dayKey) => {
    const found = data.find((d) => d.dayKey === dayKey);
    return {
      dayKey,
      slots: found?.slots || [],
    };
  });

  const allSlotNames = useMemo(() => {
    const set = new Set();
    rows.forEach((r) =>
      r.slots.forEach((s) => {
        set.add(s.name);
      }),
    );
    return Array.from(set);
  }, [rows]);

  if (!cityId || !month) {
    return (
      <p className="text-sm text-gray-500">
        Select City and Month to view Awqatus Salah.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border shadow">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-slate-200 text-slate-800">
            <tr>
              <th className="px-3 py-2">Day</th>
              {allSlotNames.map((slot) => (
                <th key={slot} className="px-3 py-2 text-left capitalize">
                  {slot.replace(/_/g, " ")}
                </th>
              ))}
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.dayKey} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{r.dayKey}</td>

                {allSlotNames.map((slot) => {
                  const value = r.slots.find((s) => s.name === slot)?.time;
                  return (
                    <td key={slot} className="px-3 py-2 whitespace-nowrap">
                      {minutesToTime(value)}
                    </td>
                  );
                })}

                <td className="px-3 py-2 text-right">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs"
                    onClick={() =>
                      setEditing({
                        city: cityId,
                        area: areaId || null,
                        dayKey: r.dayKey,
                        slots: r.slots,
                      })
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {!rows.length && !loading && (
              <tr>
                <td
                  colSpan={100}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No timings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <AddManualTimingModal
          open={true}
          onClose={() => setEditing(null)}
          prefill={editing}
          onSaved={() => {
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
