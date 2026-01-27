// src/app/dashboard/super-admin/manage/modules/ramzan/RamzanPreview.js

"use client";

import { useEffect, useState } from "react";

function minToTime(min) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  let h = h24 % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

export default function RamzanPreview({ config }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!config?._id) return;

    fetch(`/api/super-admin/ramzan-config/preview?configId=${config._id}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setRows(j.days || []));
  }, [config]);

  if (!rows.length) return null;

  return (
    <div className="bg-white rounded-xl border shadow mt-6">
      <div className="px-4 py-2 border-b font-medium">
        Ramzan Preview (Derived from DayKey)
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">DayKey</th>
            <th className="p-2 text-left">Sehri Ends</th>
            <th className="p-2 text-left">Iftar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.dayKey} className="border-t">
              <td className="p-2">{r.dayKey}</td>
              <td className="p-2">{minToTime(r.sehriEnd)}</td>
              <td className="p-2 font-semibold text-emerald-700">
                {minToTime(r.iftar)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
