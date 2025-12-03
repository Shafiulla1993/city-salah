// src/app/dashboard/super-admin/manage/modules/timings/DeleteTemplateModal.js

"use client";

import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";
import { useState } from "react";

export default function DeleteTemplateModal({
  open,
  onClose,
  templateId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!templateId) return;
    setLoading(true);
    try {
      const res = await adminAPI.deleteTimingTemplate(templateId);
      if (res?.success) {
        notify.success("Template deleted");
        onDeleted?.(templateId);
        onClose();
      } else {
        notify.error(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete template");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Template" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this template? Existing mappings might
          break if they depend on it.
        </p>

        <div className="flex justify-end gap-3">
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
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
