// src/app/dashboard/super-admin/manage/modules/ramzan/RamzanConfigForm.js

"use client";

import { useMemo, useState } from "react";
import { notify } from "@/lib/toast";

export default function RamzanConfigForm({ cities, areas, onSaved }) {
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [sourceCity, setSourceCity] = useState("");
  const [sourceArea, setSourceArea] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [offset, setOffset] = useState(3);
  const [saving, setSaving] = useState(false);

  const filteredAreas = useMemo(
    () => areas.filter((a) => !city || a.city?._id === city),
    [areas, city],
  );

  const filteredSourceAreas = useMemo(
    () => areas.filter((a) => !sourceCity || a.city?._id === sourceCity),
    [areas, sourceCity],
  );

  async function save() {
    if (!city || !sourceCity || !startDate || !endDate)
      return notify.error("Fill all required fields");

    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/ramzan-config", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          area: area || null,
          sourceCity,
          sourceArea: sourceArea || null,
          startDate,
          endDate,
          iftarOffsetMinutes: Number(offset),
        }),
      });

      const json = await res.json();
      if (json.success) {
        notify.success("Ramzan configuration saved");
        onSaved(json.data);
      } else {
        notify.error(json.message || "Save failed");
      }
    } catch (e) {
      notify.error("Server error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">City *</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setArea("");
            }}
          >
            <option value="">Select</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm">Area</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">All Areas</option>
            {filteredAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Source City *</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={sourceCity}
            onChange={(e) => {
              setSourceCity(e.target.value);
              setSourceArea("");
            }}
          >
            <option value="">Select</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm">Source Area</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={sourceArea}
            onChange={(e) => setSourceArea(e.target.value)}
          >
            <option value="">All Areas</option>
            {filteredSourceAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Start Date *</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">End Date *</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Iftar Offset (min)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={saving}
          onClick={save}
          className="px-4 py-2 bg-emerald-600 text-white rounded"
        >
          {saving ? "Saving..." : "Save Ramzan Timetable"}
        </button>
      </div>
    </div>
  );
}
