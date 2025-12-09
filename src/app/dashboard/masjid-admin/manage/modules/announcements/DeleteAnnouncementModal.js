// src/app/dashboard/masjid-admin/manage/modules/announcements/DeleteAnnouncementModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { mAdminAPI } from "@/lib/api/mAdmin";
import { notify } from "@/lib/toast";

export default function DeleteAnnouncementModal({
  open,
  onClose,
  announcementId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await mAdminAPI.deleteAnnouncement(announcementId);
      if (res?.success) {
        notify.success("Deleted");
        onDeleted?.(announcementId);
        onClose();
      } else notify.error(res?.message || "Delete failed");
    } catch {
      notify.error("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Announcement" size="sm">
      <div className="space-y-6">
        <p className="text-gray-700">
          Are you sure you want to delete this announcement?
        </p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
