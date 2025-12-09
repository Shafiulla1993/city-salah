// src/app/dashboard/masjid-admin/manage/modules/announcements/AddAnnouncementModal.js

"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/admin/Modal";
import { mAdminAPI } from "@/lib/api/mAdmin";
import { notify } from "@/lib/toast";

export default function AddAnnouncementModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", body: "", images: [] });
  const [masjids, setMasjids] = useState([]);
  const [masjidId, setMasjidId] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  // Load masjids when modal opens
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const res = await mAdminAPI.getMyMasjids();
        const list = res?.data ?? [];
        setMasjids(list);
        if (list.length) setMasjidId(list[0]._id);
      } catch {
        notify.error("Failed to load masjids");
      }
    })();
  }, [open]);

  async function submit(e) {
    e.preventDefault();
    if (!masjidId) return notify.error("Select a masjid");
    if (!form.title.trim()) return notify.error("Title required");
    if (!form.body.trim()) return notify.error("Body required");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    fd.append("masjidId", masjidId);
    for (const f of form.images) fd.append("file", f);

    setLoading(true);
    try {
      const res = await mAdminAPI.createAnnouncement(masjidId, fd);
      if (res?.success) {
        notify.success("Announcement created");
        onCreated?.();
        onClose();
        setForm({ title: "", body: "", images: [] });
      } else notify.error(res?.message || "Create failed");
    } catch {
      notify.error("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Announcement" size="lg">
      <form onSubmit={submit} className="space-y-5">
        {/* MASJID SELECTION */}
        <div>
          <label className="block mb-1 font-medium">Masjid *</label>
          <select
            className="border rounded w-full p-2"
            value={masjidId}
            onChange={(e) => setMasjidId(e.target.value)}
          >
            {masjids.length === 0 ? (
              <option>No masjids assigned</option>
            ) : (
              masjids.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))
            )}
          </select>
        </div>

        <input
          className="border rounded w-full p-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <textarea
          className="border rounded w-full p-2"
          rows={4}
          placeholder="Announcement text"
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
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
