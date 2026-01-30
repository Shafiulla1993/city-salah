// src/app/dashboard/super-admin/manage/modules/hijri/AddCityHijriModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function AddCityHijriModal({ open, onClose, onSaved }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    fetch("/api/super-admin/cities?limit=1000", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j) => setCities(j.data || []));
  }, [open]);

  async function save() {
    if (!city) return notify.error("Select city");

    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/hijri-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "city",
          city,
          hijriOffset: Number(offset),
        }),
      });

      const json = await res.json();
      if (json.success) {
        notify.success("City override saved");
        onSaved?.();
        onClose();
      } else {
        notify.error(json.message || "Save failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="City Hijri Override" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">City</label>
          <select
            className="w-full border px-2 py-2 rounded"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
          <label className="block text-sm mb-1">Hijri Offset</label>
          <select
            className="w-full border px-2 py-2 rounded"
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
          >
            {[-2, -1, 0, 1, 2].map((v) => (
              <option key={v} value={v}>
                {v > 0 ? `+${v}` : v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 text-white rounded"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
