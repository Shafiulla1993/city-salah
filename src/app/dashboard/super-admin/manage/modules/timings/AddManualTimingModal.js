// src/app/dashboard/super-admin/manage/modules/timings/AddManualTimingModal.js

"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import ManualTimingForm from "./ManualTimingForm";
import { normalizeTime } from "@/lib/helpers/normalizeTime";

export default function AddManualTimingModal({
  open,
  onClose,
  cities = [],
  areas = [],
  prefill,
  onSaved,
}) {
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [dayKey, setDayKey] = useState(""); // MM-DD
  const [timings, setTimings] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredAreas = useMemo(
    () => areas.filter((a) => !cityId || a.city?._id === cityId),
    [areas, cityId],
  );

  useEffect(() => {
    if (!open) return;

    if (prefill) {
      setCityId(prefill.city || "");
      setAreaId(prefill.area || "");
      setDayKey(prefill.dayKey || "");
      const obj = {};
      (prefill.slots || []).forEach((s) => (obj[s.name] = s.time));
      setTimings(obj);
    } else {
      setCityId("");
      setAreaId("");
      setDayKey("");
      setTimings({});
    }
  }, [open, prefill]);

  async function handleSave() {
    if (!cityId) return notify.error("City is required");
    if (!dayKey) return notify.error("Day (MM-DD) is required");

    const formattedSlots = Object.entries(timings)
      .filter(([, v]) => v !== "" && v !== null && v !== undefined)
      .map(([key, value]) => ({
        name: key,
        time: normalizeTime(value, key),
      }));

    if (!formattedSlots.length)
      return notify.error("Please enter at least one timing");

    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/general-prayer-timings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityId,
          area: areaId || null,
          dayKey,
          slots: formattedSlots,
        }),
      });

      const json = await res.json();

      if (json.success) {
        notify.success("Day timings saved");
        onSaved?.(json.data);
        onClose();
      } else {
        notify.error(json.message || "Failed to save timings");
      }
    } catch (err) {
      console.error(err);
      notify.error("Error while saving timings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add / Edit Day Timings"
      size="3xl"
    >
      <div className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">
              Day (MM-DD)
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="01-19"
              value={dayKey}
              onChange={(e) => setDayKey(e.target.value)}
            />
          </div>
        </div>

        {/* Timings Form */}
        <ManualTimingForm value={timings} onChange={setTimings} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-2 rounded bg-slate-700 text-white"
          >
            {loading ? "Saving…" : "Save Timings"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
