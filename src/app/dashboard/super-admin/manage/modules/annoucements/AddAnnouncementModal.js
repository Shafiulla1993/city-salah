// src/app/dashboard/super-admin/manage/modules/announcements/AddAnnouncementModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import CheckboxMultiSelect from "@/components/admin/CheckboxMultiSelect";

export default function AddAnnouncementModal({ open, onClose, onCreated }) {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [form, setForm] = useState({
    title: "",
    body: "",
    startDate: "",
    endDate: "",
    cityIds: [],
    areaIds: [],
    masjidIds: [],
    images: [],
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      title: "",
      body: "",
      startDate: "",
      endDate: "",
      cityIds: [],
      areaIds: [],
      masjidIds: [],
      images: [],
    });

    (async () => {
      const [c, a, m] = await Promise.all([
        fetch("/api/super-admin/cities", { credentials: "include" }),
        fetch("/api/super-admin/areas?limit=2000", { credentials: "include" }),
        fetch("/api/super-admin/masjids?limit=5000", {
          credentials: "include",
        }),
      ]);

      setCities((await c.json()).data || []);
      setAreas((await a.json()).data || []);
      setMasjids((await m.json()).data || []);
    })();
  }, [open]);

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/uploads/announcement-image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(status = "draft") {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    fd.append("status", status);

    form.cityIds.forEach((id) => fd.append("cities[]", id));
    form.areaIds.forEach((id) => fd.append("areas[]", id));
    form.masjidIds.forEach((id) => fd.append("masjids[]", id));
    form.images.forEach((url) => fd.append("images", url));

    const res = await fetch("/api/super-admin/general-announcements", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    const data = await res.json();

    if (data?.success) {
      const detail = await fetch(
        `/api/super-admin/general-announcements/${data.data._id}`,
        { credentials: "include" },
      ).then((r) => r.json());

      notify.success(
        status === "published" ? "Announcement Published" : "Draft Saved",
      );
      onCreated?.(detail.data);
      onClose();
    } else {
      notify.error(data?.message || "Save failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Announcement" size="lg">
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border px-3 py-2 rounded"
          rows={4}
          placeholder="Body"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>

        <CheckboxMultiSelect
          label="Cities"
          items={cities}
          selected={form.cityIds}
          onChange={(v) => setForm({ ...form, cityIds: v })}
        />
        <CheckboxMultiSelect
          label="Areas"
          items={areas}
          selected={form.areaIds}
          onChange={(v) => setForm({ ...form, areaIds: v })}
        />
        <CheckboxMultiSelect
          label="Masjids"
          items={masjids}
          selected={form.masjidIds}
          onChange={(v) => setForm({ ...form, masjidIds: v })}
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const urls = [];
            for (const f of files) urls.push(await uploadImage(f));
            setForm((s) => ({ ...s, images: [...s.images, ...urls] }));
          }}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 border rounded"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            className="px-4 py-2 bg-slate-700 text-white rounded"
          >
            Publish
          </button>
        </div>
      </div>
    </Modal>
  );
}
