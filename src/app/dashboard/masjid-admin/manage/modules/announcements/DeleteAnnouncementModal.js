// src/app/dashboard/masjid-admin/manage/modules/announcements/DeleteAnnouncementModal.js

"use client";

import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function DeleteAnnouncementModal({
  open,
  onClose,
  announcement,
  masjidId,
  onDeleted,
}) {
  async function remove() {
    try {
      const res = await fetch(
        `/api/masjid-admin/masjids/${masjidId}/announcements/${announcement._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      notify.success("Announcement deleted");
      onDeleted();
    } catch (err) {
      notify.error(err.message || "Delete failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Announcement">
      <p>Are you sure you want to delete this announcement?</p>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="border px-4 py-2 rounded">
          Cancel
        </button>
        <button
          onClick={remove}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
