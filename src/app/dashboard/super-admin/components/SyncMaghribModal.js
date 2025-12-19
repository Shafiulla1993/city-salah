// src/app/dashboard/super-admin/components/SyncMaghribModal.js

"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/components/admin/AdminButton";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function SyncMaghribModal({ open, onClose }) {
  const [cities, setCities] = useState([]);
  const [cityId, setCityId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [syncing, setSyncing] = useState(false);

  /* ---------------- Load cities ---------------- */
  useEffect(() => {
    if (!open) return;

    async function loadCities() {
      try {
        const res = await adminAPI.getCities("?limit=1000");
        setCities(res?.data || []);
      } catch {
        notify.error("Failed to load cities");
      }
    }

    loadCities();
  }, [open]);

  /* ---------------- Sync action ---------------- */
  async function syncMaghrib() {
    if (syncing) return;

    const scopeLabel = cityId
      ? cities.find((c) => c._id === cityId)?.name || "selected city"
      : "ALL cities";

    const confirm = window.confirm(
      `This will sync Maghrib timings for ${scopeLabel} on ${date}.\n\nContinue?`
    );
    if (!confirm) return;

    setSyncing(true);
    try {
      const res = await adminAPI.syncMaghrib({
        date,
        ...(cityId ? { cityId } : {}),
      });

      if (res?.success) {
        notify.success(`Maghrib synced for ${res.count} masjids`);
        onClose();
      } else {
        notify.error(res?.message || "Sync failed");
      }
    } catch {
      notify.error("Failed to sync Maghrib timings");
    } finally {
      setSyncing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Sync Maghrib Timings
        </h2>

        {/* Date */}
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm mb-1">City (optional)</label>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <AdminButton onClick={onClose} disabled={syncing}>
            Cancel
          </AdminButton>
          <AdminButton
            onClick={syncMaghrib}
            disabled={syncing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {syncing ? "Syncing..." : "Sync Maghrib"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
