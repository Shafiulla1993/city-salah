// src/app/dashboard/super-admin/manage/modules/announcements/DeleteAnnouncementModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
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
      const res = await adminAPI.deleteAnnouncement(announcementId);
      if (res?.success) {
        notify.success("Announcement deleted");
        onDeleted?.(announcementId);
        onClose();
      } else {
        notify.error(res?.message || "Delete failed");
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
        <p className="text-gray-700 text-sm">
          Are you sure you want to delete this announcement?
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
          >
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
