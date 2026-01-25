// src/app/dashboard/masjid-admin/manage/modules/announcements/AddAnnouncementModal.js

"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function AddAnnouncementModal({
  open,
  onClose,
  masjidId,
  onCreated,
}) {
  const [form, setForm] = useState({ title: "", body: "", images: [] });
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!masjidId) return notify.error("No masjid selected");
    if (!form.title || !form.body)
      return notify.error("Title and body required");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    for (const f of form.images) fd.append("file", f);

    setLoading(true);
    try {
      const res = await fetch(
        `/api/masjid-admin/masjids/${masjidId}/announcements`,
        {
          method: "POST",
          body: fd,
          credentials: "include",
        },
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      notify.success("Announcement created");
      onCreated?.();
      onClose();
      setForm({ title: "", body: "", images: [] });
    } catch (err) {
      notify.error(err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Announcement" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <input
          className="border p-2 w-full rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <textarea
          className="border p-2 w-full rounded"
          rows={4}
          placeholder="Announcement body"
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
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button className="bg-slate-700 text-white px-4 py-2 rounded">
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
