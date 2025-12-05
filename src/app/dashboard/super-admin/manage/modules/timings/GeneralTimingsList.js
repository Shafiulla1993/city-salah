// src/app/dashboard/super-admin/manage/modules/GeneralTimingsList.js

"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";
import AddManualTimingModal from "./AddManualTimingModal";

function minutesToTimeString(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined) return "-";
  const m = totalMinutes % 60;
  let h = Math.floor(totalMinutes / 60);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m.toString().padStart(2, "0");
  return `${h}:${mm} ${period}`;
}

export default function GeneralTimingsList({ cities = [], areas = [] }) {
  const [localCities, setLocalCities] = useState([]);
  const [localAreas, setLocalAreas] = useState([]);

  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [month, setMonth] = useState("");

  const [loading, setLoading] = useState(false);
  const [timings, setTimings] = useState([]);

  const [editing, setEditing] = useState(null);

  const allCities = cities.length ? cities : localCities;
  const allAreas = areas.length ? areas : localAreas;

  const filteredAreas = useMemo(
    () => allAreas.filter((a) => !cityId || a.city?._id === cityId),
    [allAreas, cityId]
  );

  // Load cities/areas if not passed
  useEffect(() => {
    if (cities.length && areas.length) return;
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          adminAPI.getCities?.(),
          adminAPI.getAreas?.("?limit=2000"),
        ]);
        if (cRes?.data) setLocalCities(cRes.data);
        if (aRes?.data) setLocalAreas(aRes.data);
      } catch (err) {
        console.error("Failed to load cities/areas:", err);
      }
    })();
  }, [cities, areas]);

  function getMonthRange(monthStr) {
    if (!monthStr) return {};
    const [yearStr, monthNumStr] = monthStr.split("-");
    const year = Number(yearStr);
    const monthNum = Number(monthNumStr);
    if (!year || !monthNum) return {};
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };
  }

  async function handleLoad() {
    if (!cityId) return notify.error("Select city");
    if (!month) return notify.error("Select month");

    const { start, end } = getMonthRange(month);
    if (!start || !end) return notify.error("Invalid month");

    setLoading(true);
    try {
      const res = await adminAPI.getGeneralTimingsRange({
        cityId,
        areaId: areaId || "",
        start,
        end,
      });

      if (res?.success) {
        setTimings(res.data || []);
      } else {
        notify.error(res?.message || "Failed to load timings");
      }
    } catch (err) {
      console.error(err);
      notify.error("Error while loading timings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm font-medium">City *</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setAreaId("");
            }}
          >
            <option value="">Select City</option>
            {allCities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Area (optional)</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
          >
            <option value="">All Areas</option>
            {filteredAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Month (YYYY-MM)</label>
          <input
            type="month"
            className="w-full border px-3 py-2 rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load Timings"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-x-auto rounded-xl border shadow">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-slate-200 text-slate-800">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">Source</th>

              {/* Dynamic Slot Columns */}
              {Array.from(
                new Set(
                  timings.flatMap((t) => t.slots?.map((s) => s.name) || [])
                )
              ).map((slot) => (
                <th key={slot} className="px-3 py-2 text-left capitalize">
                  {slot.replace(/_/g, " ")}
                </th>
              ))}

              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {timings.map((t) => (
              <tr key={t._id} className="hover:bg-slate-50">
                <td className="px-3 py-2">{t.date}</td>
                <td className="px-3 py-2">{t.city?.name || "-"}</td>
                <td className="px-3 py-2">{t.area?.name || "-"}</td>
                <td className="px-3 py-2 capitalize">{t.source || "-"}</td>

                {/* Dynamic slot cells */}
                {Array.from(
                  new Set(
                    timings.flatMap((ti) => ti.slots?.map((s) => s.name) || [])
                  )
                ).map((slot) => {
                  const value = t.slots?.find((s) => s.name === slot)?.time;
                  return (
                    <td key={slot} className="px-3 py-2 whitespace-nowrap">
                      {minutesToTimeString(value)}
                    </td>
                  );
                })}

                <td className="px-3 py-2 text-right">
                  <button
                    className="px-3 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800"
                    onClick={() =>
                      setEditing({
                        city: t.city?._id,
                        area: t.area?._id || "",
                        date: t.date,
                        slots: t.slots || [],
                      })
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {!timings.length && !loading && (
              <tr>
                <td
                  colSpan={100}
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No timings found. Select filters and click <b>Load Timings</b>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <AddManualTimingModal
          open={true}
          onClose={() => setEditing(null)}
          cities={allCities}
          areas={allAreas}
          prefill={editing}
          onSaved={() => {
            setEditing(null);
            handleLoad(); // refresh after save
          }}
        />
      )}
    </div>
  );
}
