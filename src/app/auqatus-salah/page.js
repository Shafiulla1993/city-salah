// src/app/auqatus-salah/page

"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { publicAPI } from "@/lib/api/public";
import { toast } from "react-toastify";

function minutesToTimeString(min) {
  if (min === null || min === undefined) return "-";
  const m = min % 60;
  let h = Math.floor(min / 60);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function AuqatusSalahPage() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timings, setTimings] = useState(null);

  const loadCities = async () => {
    const res = await publicAPI.getCities();
    setCities(res);
  };

  const loadAreas = async (c) => {
    const res = await publicAPI.getAreas(c);
    setAreas(res);
  };

  const loadTimings = async () => {
    if (!cityId) return toast.error("Select city");
    const res = await publicAPI.getGeneralTimings({ cityId, areaId, date });
    if (res?.success) setTimings(res.data);
    else toast.error(res?.message || "No timings found");
  };

  useEffect(() => {
    loadCities();
  }, []);
  useEffect(() => {
    if (!cityId) {
      setAreas([]);
      setAreaId("");
      return;
    }
    loadAreas(cityId);
  }, [cityId]);

  useEffect(() => {
    loadTimings();
  }, [date, cityId, areaId]);

  const slotCols = timings?.slots || [];

  const left = null;
  const right = (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Auqatus Salah</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="border px-3 py-2 rounded"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Table */}
      {timings && (
        <div className="overflow-x-auto">
          <table className="w-full border rounded text-sm">
            <thead className="bg-slate-200">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">End</th>
              </tr>
            </thead>
            <tbody>
              {timings.slots?.map((s) => (
                <tr key={s.name} className="border-t">
                  <td className="px-3 py-2 capitalize">
                    {s.name.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2">{minutesToTimeString(s.start)}</td>
                  <td className="px-3 py-2">{minutesToTimeString(s.end)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return <DashboardLayout left={left} right={right} />;
}
