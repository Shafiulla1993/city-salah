// src/app/dashboard/masjid-admin/manage/modules/announcements/EditAnnouncementModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function EditAnnouncementModal({
  open,
  onClose,
  announcement,
  masjidId,
  onUpdated,
}) {
  const [title, setTitle] = useState(announcement.title);
  const [body, setBody] = useState(announcement.body);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `/api/masjid-admin/masjids/${masjidId}/announcements/${announcement._id}`,
        {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ title, body }),
        },
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      notify.success("Announcement updated");
      onUpdated();
    } catch (err) {
      notify.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Announcement">
      <form onSubmit={submit} className="space-y-4">
        <input
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full rounded"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button className="bg-slate-700 text-white px-4 py-2 rounded">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
