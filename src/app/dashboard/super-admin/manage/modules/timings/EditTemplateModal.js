// src/app/dashboard/super-admin/manage/modules/timings/EditTemplateModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function EditTemplateModal({
  open,
  onClose,
  templateId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [recurrence, setRecurrence] = useState("recurring");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (!open || !templateId) return;
    loadTemplate();
  }, [open, templateId]);

  async function loadTemplate() {
    setLoading(true);
    try {
      const all = await adminAPI.getTimingTemplates();
      const t = all?.data?.find((x) => x._id === templateId);
      if (!t) return;

      setTemplate(t);
      setName(t.name || "");
      setTimezone(t.timezone || "Asia/Kolkata");
      setRecurrence(t.recurrence || "recurring");
      setYear(t.year || "");
    } catch (err) {
      console.error(err);
      notify.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      notify.error("Template name is required");
      return;
    }

    setLoading(true);
    try {
      // you need adminAPI.updateTimingTemplate on frontend + PUT route on backend
      const payload = {
        name,
        timezone,
        recurrence,
        year: recurrence === "year-specific" ? Number(year) || null : null,
      };

      const res = await adminAPI.updateTimingTemplate(templateId, payload);

      if (res?.success) {
        notify.success("Template updated");
        onUpdated?.(res.data);
        onClose();
      } else {
        notify.error(res?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to update template");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Template" size="md">
      {loading || !template ? (
        <div className="py-10 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recurrence</label>
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
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
