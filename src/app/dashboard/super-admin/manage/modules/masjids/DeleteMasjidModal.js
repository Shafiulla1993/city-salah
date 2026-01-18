// src/app/dashboard/super-admin/manage/modules/masjids/DeleteMasjidModal.js
"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function DeleteMasjidModal({
  open,
  onClose,
  masjidId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await fetch(`/api/super-admin/masjids/${masjidId}`, {
        method: "DELETE",
        credentials: "include",
      });
      notify.success("Masjid deleted");
      onDeleted?.();
      onClose();
    } catch {
      notify.error("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Masjid" size="sm">
      <div className="space-y-4">
        <p>Are you sure you want to delete this masjid?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
