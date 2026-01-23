// src/app/dashboard/super-admin/manage/modules/timings/CloneAwqatusModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function CloneAwqatusModal({
  open,
  onClose,
  cities,
  areas,
  onDone,
}) {
  const [sourceCity, setSourceCity] = useState("");
  const [sourceArea, setSourceArea] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [targetArea, setTargetArea] = useState("");
  const [offset, setOffset] = useState("0");
  const [loading, setLoading] = useState(false);

  async function handleClone() {
    if (!sourceCity || !targetCity)
      return notify.error("Select source and target city");

    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/general-prayer-timings/clone", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCity,
          sourceArea: sourceArea || null,
          targetCity,
          targetArea: targetArea || null,
          offsetMinutes: Number(offset),
        }),
      });

      const json = await res.json();

      if (json.success) {
        notify.success(`Cloned ${json.total} days with offset ${offset} min`);
        onDone?.();
        onClose();
      } else {
        notify.error(json.message || "Clone failed");
      }
    } catch (e) {
      console.error(e);
      notify.error("Clone error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Clone Awqatus Salah" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Source City</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={sourceCity}
              onChange={(e) => setSourceCity(e.target.value)}
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
            <label className="block text-sm mb-1">Target City</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
            >
              <option value="">Select</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Source Area</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={sourceArea}
              onChange={(e) => setSourceArea(e.target.value)}
            >
              <option value="">All</option>
              {areas
                .filter((a) => a.city?._id === sourceCity)
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Target Area</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={targetArea}
              onChange={(e) => setTargetArea(e.target.value)}
            >
              <option value="">All</option>
              {areas
                .filter((a) => a.city?._id === targetCity)
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Offset (minutes)</label>
          <input
            type="number"
            className="w-full border px-2 py-1 rounded"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
            placeholder="e.g. 2 or -1"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleClone}
            className="px-4 py-2 bg-slate-700 text-white rounded"
          >
            {loading ? "Cloning..." : "Clone"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
