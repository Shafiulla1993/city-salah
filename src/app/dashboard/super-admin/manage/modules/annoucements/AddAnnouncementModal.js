// src/app/dashboard/super-admin/manage/modules/announcements/AddAnnouncementModal.js

"use client";
import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import { adminAPI } from "@/lib/api/sAdmin";
import CheckboxMultiSelect from "@/components/admin/CheckboxMultiSelect";

export default function AddAnnouncementModal({
  open,
  onClose,
  onCreated,
  cities = [],
  areas = [],
  masjids = [],
}) {
  const [loading, setLoading] = useState(false);
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

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return notify.error("Title is required");
    if (!form.body.trim()) return notify.error("Body is required");
    if (!form.startDate || !form.endDate)
      return notify.error("Date range is required");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);

    form.cityIds.forEach((id) => fd.append("cities[]", id));
    form.areaIds.forEach((id) => fd.append("areas[]", id));
    form.masjidIds.forEach((id) => fd.append("masjids[]", id));
    form.images.forEach((f) => fd.append("images", f));

    setLoading(true);
    try {
      const res = await adminAPI.createAnnouncement(fd);
      if (res?.success) {
        notify.success("Announcement created");
        onCreated?.();
        onClose();
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
      } else notify.error(res?.message || "Create failed");
    } catch {
      notify.error("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Announcement" size="lg">
      <form onSubmit={submit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />

        {/* Body */}
        <textarea
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Enter message"
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </div>

        {/* Multi-selects */}
        <CheckboxMultiSelect
          label="Cities (optional)"
          items={cities}
          selected={form.cityIds}
          onChange={(val) => update("cityIds", val)}
        />
        <CheckboxMultiSelect
          label="Areas (optional)"
          items={areas}
          selected={form.areaIds}
          onChange={(val) => update("areaIds", val)}
        />
        <CheckboxMultiSelect
          label="Masjids (optional)"
          items={masjids}
          selected={form.masjidIds}
          onChange={(val) => update("masjidIds", val)}
        />

        {/* Images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => update("images", Array.from(e.target.files || []))}
          className="text-sm"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-700 text-white"
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
