// src/app/dashboard/super-admin/manage/modules/timings/ImportCSVModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function ImportCSVModal({
  open,
  onClose,
  cityId,
  areaId,
  onDone,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!cityId) return notify.error("Select City first");
    if (!file) return notify.error("Select CSV file");

    setLoading(true);
    try {
      const text = await file.text();

      const res = await fetch(
        "/api/super-admin/general-prayer-timings/import-csv",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: cityId,
            area: areaId || null,
            csvText: text,
          }),
        },
      );

      const json = await res.json();
      if (json.success) {
        notify.success(`Imported ${json.total} days`);
        onDone?.();
        onClose();
        setFile(null);
      } else {
        notify.error(json.message || "Import failed");
      }
    } catch (e) {
      console.error(e);
      notify.error("Import error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Awqatus Salah CSV"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">CSV File *</label>
          <input
            type="file"
            accept=".csv,.tsv,text/csv,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-500 mt-1">
            First column: date (1-Jan). Other columns: sehri_end, fajr_start,
            ...
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 text-white rounded"
          >
            {loading ? "Importing..." : "Import CSV"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
