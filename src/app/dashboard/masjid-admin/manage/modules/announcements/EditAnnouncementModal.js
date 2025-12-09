// src/app/dashboard/masjid-admin/manage/modules/announcements/EditAnnouncementModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { mAdminAPI } from "@/lib/api/mAdmin";
import { notify } from "@/lib/toast";

export default function EditAnnouncementModal({
  open,
  onClose,
  announcementId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", images: [] });

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  useEffect(() => {
    if (!open || !announcementId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await mAdminAPI.getAnnouncementById(announcementId);
        const a = res?.data;
        setInitial(a);
        setForm({ title: a.title, body: a.body, images: [] });
      } catch {
        notify.error("Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, announcementId]);

  async function submit(e) {
    e.preventDefault();
    if (!initial) return;

    const fd = new FormData();
    fd.append("title", form.title); // always include
    fd.append("body", form.body); // always include
    for (const f of form.images) fd.append("file", f);

    setLoading(true);
    try {
      const res = await mAdminAPI.updateAnnouncement(announcementId, fd);
      if (res?.success) {
        notify.success("Announcement updated");
        onUpdated?.();
        onClose();
      } else notify.error(res?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Announcement" size="lg">
      {loading && !initial ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <input
            className="border rounded w-full p-2"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
          <textarea
            className="border rounded w-full p-2"
            rows={4}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => update("images", Array.from(e.target.files || []))}
          />

          <div className="flex justify-end gap-3">
            <button
              className="border px-4 py-2 rounded-lg"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="bg-slate-700 text-white px-4 py-2 rounded-lg">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
