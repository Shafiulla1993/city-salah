// src/app/dashboard/super-admin/manage/modules/timings/DeleteMappingModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function DeleteMappingModal({
  open,
  onClose,
  mappingId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!mappingId) return;
    setLoading(true);
    try {
      const res = await adminAPI.deleteTimingMapping(mappingId);
      if (res?.success) {
        notify.success("Mapping deleted");
        onDeleted?.(mappingId);
        onClose();
      } else {
        notify.error(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete mapping");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Mapping" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this mapping? Affected city/area will
          no longer have general timings.
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
