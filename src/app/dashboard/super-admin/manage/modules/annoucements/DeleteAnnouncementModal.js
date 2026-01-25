// src/app/dashboard/super-admin/manage/modules/announcements/DeleteAnnouncementModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function DeleteAnnouncementModal({
  open,
  onClose,
  announcementId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!announcementId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/super-admin/general-announcements/${announcementId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (data?.success) {
        notify.success("Announcement deleted");
        onDeleted?.(announcementId);
        onClose();
      } else {
        notify.error(data?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Announcement" size="sm">
      <div className="space-y-4">
        <p>Are you sure you want to delete this announcement?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
