// src/app/dashboard/super-admin/manage/modules/timings/AddManualTimingModal.js

"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import { adminAPI } from "@/lib/api/sAdmin";
import ManualTimingForm from "./ManualTimingForm";

export default function AddManualTimingModal({
  open,
  onClose,
  cities = [],
  areas = [],
  onSaved,
}) {
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [date, setDate] = useState("");
  const [timings, setTimings] = useState({});
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const filteredAreas = useMemo(
    () => areas.filter((a) => !cityId || a.city?._id === cityId),
    [areas, cityId]
  );

  useEffect(() => {
    if (!open) {
      setCityId("");
      setAreaId("");
      setDate("");
      setTimings({});
      setLoading(false);
      setPrefillLoading(false);
    }
  }, [open]);

  // Try to prefill timings when city+area+date all selected
  useEffect(() => {
    if (!open) return;
    if (!cityId || !areaId || !date) return;

    (async () => {
      setPrefillLoading(true);
      try {
        // 1) Try existing record for SAME day
        const resToday = await adminAPI.getGeneralTimingByDate({
          cityId,
          areaId,
          date,
        });

        if (resToday?.success && resToday.data?.slots) {
          setTimings(resToday.data.slots);
          setPrefillLoading(false);
          return;
        }

        // 2) Try yesterday to auto-copy
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        const y = d.toISOString().slice(0, 10);

        const resPrev = await adminAPI.getGeneralTimingByDate({
          cityId,
          areaId,
          date: y,
        });

        if (resPrev?.success && resPrev.data?.slots) {
          setTimings(resPrev.data.slots);
        } else {
          setTimings({});
        }
      } catch (err) {
        console.error("prefill error", err);
      } finally {
        setPrefillLoading(false);
      }
    })();
  }, [open, cityId, areaId, date]);

  async function handleSave() {
    if (!cityId) return notify.error("City is required");
    if (!areaId) return notify.error("Area is required");
    if (!date) return notify.error("Date is required");

    setLoading(true);
    try {
      const payload = {
        city: cityId,
        area: areaId,
        date,
        slots: timings, // { sehri_end: "5:21 AM", fajr_start: "5:30 AM", ... }
      };

      const res = await adminAPI.createManualTiming(payload);

      if (res?.success) {
        notify.success("Day timings saved");
        onSaved?.(res.data);
        onClose();
      } else {
        notify.error(res?.message || "Failed to save timings");
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
      title="Add / Override Day Timings"
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
            <label className="block text-sm font-medium mb-1">Area *</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
            >
              <option value="">Select Area</option>
              {filteredAreas.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date * (YYYY-MM-DD)
            </label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {prefillLoading && (
          <p className="text-xs text-gray-500">
            Loading existing / yesterday's timings…
          </p>
        )}

        {/* Timings Table */}
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
