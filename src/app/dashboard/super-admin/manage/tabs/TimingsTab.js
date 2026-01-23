// src/app/dashboard/super-admin/manage/tabs/TimingsTab.js

// src/app/dashboard/super-admin/manage/tabs/TimingsTab.js

"use client";

import { useEffect, useMemo, useState } from "react";
import AddManualTimingModal from "../modules/timings/AddManualTimingModal";
import GeneralTimingsList from "../modules/timings/GeneralTimingsList";
import TimingsSkeleton from "../modules/timings/TimingsSkeleton";
import ImportCSVModal from "../modules/timings/ImportCSVModal";
import CloneAwqatusModal from "../modules/timings/CloneAuqatusModal";

export default function TimingsTab() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [month, setMonth] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBase() {
      try {
        const [cityRes, areaRes] = await Promise.all([
          fetch("/api/super-admin/cities", { credentials: "include" }),
          fetch("/api/super-admin/areas?limit=2000", {
            credentials: "include",
          }),
        ]);

        const cityJson = await cityRes.json();
        const areaJson = await areaRes.json();

        if (!mounted) return;

        setCities(cityJson?.data || []);
        setAreas(areaJson?.data || []);
      } catch (err) {
        console.error("Failed to load cities/areas:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBase();
    return () => (mounted = false);
  }, []);

  const filteredAreas = useMemo(
    () => areas.filter((a) => !cityId || a.city?._id === cityId),
    [areas, cityId],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Awqatus Salah (DayKey)</h2>
          <p className="text-sm text-gray-600">
            One-time yearly timings reused every year (MM-DD based)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1.5 rounded border text-sm hover:bg-slate-100"
            onClick={() => setImportOpen(true)}
          >
            Import CSV
          </button>

          <button
            className="px-3 py-1.5 rounded border text-sm hover:bg-slate-100"
            onClick={() => setCloneOpen(true)}
          >
            Clone with Offset
          </button>

          <button
            className="px-3 py-1.5 rounded bg-slate-800 text-white text-sm hover:bg-slate-700"
            onClick={() => setAddOpen(true)}
          >
            + Add / Edit Day
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">City *</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
              setAreaId("");
            }}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Area (optional)
          </label>
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
          <label className="block text-sm font-medium mb-1">Month</label>
          <input
            type="month"
            className="w-full border px-3 py-2 rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <TimingsSkeleton />
      ) : (
        <GeneralTimingsList cityId={cityId} areaId={areaId} month={month} />
      )}

      {/* Modals */}
      <AddManualTimingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        cities={cities}
        areas={areas}
        onSaved={() => {}}
      />

      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        cityId={cityId}
        areaId={areaId}
        onDone={() => {}}
      />

      <CloneAwqatusModal
        open={cloneOpen}
        onClose={() => setCloneOpen(false)}
        cities={cities}
        areas={areas}
        onDone={() => {}}
      />
    </div>
  );
}
