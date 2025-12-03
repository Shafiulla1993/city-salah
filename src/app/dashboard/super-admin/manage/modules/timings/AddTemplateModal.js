// src/app/dashboard/super-admin/manage/modules/timings/AddTemplateModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function AddTemplateModal({ open, onClose, onCreated }) {
  const [mode, setMode] = useState("meta"); // 'meta' | 'csv'
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [recurrence, setRecurrence] = useState("recurring");
  const [year, setYear] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  function reset() {
    setMode("meta");
    setLoading(false);
    setName("");
    setTimezone("Asia/Kolkata");
    setRecurrence("recurring");
    setYear("");
    setCsvFile(null);
  }

  async function handleSubmit() {
    if (!name.trim()) {
      notify.error("Template name is required");
      return;
    }

    setLoading(true);
    try {
      let res;

      if (mode === "csv") {
        if (!csvFile) {
          notify.error("Please select CSV file");
          setLoading(false);
          return;
        }
        const text = await csvFile.text();
        const payload = { name, timezone, csv: text };
        res = await adminAPI.uploadTimingTemplateCSV(payload);
      } else {
        const payload = {
          name,
          timezone,
          recurrence,
          year: recurrence === "year-specific" ? Number(year) || null : null,
        };
        res = await adminAPI.createTimingTemplate(payload);
      }

      if (res?.success) {
        notify.success("Template created");
        onCreated?.(res.data);
        reset();
        onClose();
      } else {
        notify.error(res?.message || "Create failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to create template");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create Timing Template"
      size="lg"
    >
      <div className="space-y-5">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setMode("meta")}
            className={`px-3 py-1 rounded text-sm ${
              mode === "meta"
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Basic (no CSV)
          </button>
          <button
            type="button"
            onClick={() => setMode("csv")}
            className={`px-3 py-1 rounded text-sm ${
              mode === "csv"
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Import from CSV
          </button>
        </div>

        {/* Common fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mysore General Timings"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kolkata"
            />
          </div>

          {mode === "meta" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recurrence
                </label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  <option value="recurring">Repeats every year</option>
                  <option value="year-specific">Specific year only</option>
                </select>
              </div>

              {recurrence === "year-specific" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500">
                This will create an empty template. You can later import CSV or
                fill days via custom tools.
              </p>
            </>
          )}

          {mode === "csv" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                CSV File *
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-1">
                First column should be date (e.g. 03-12). Next columns are slot
                names with HH:MM times.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-slate-700 text-white"
          >
            {loading ? "Saving..." : "Create Template"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
