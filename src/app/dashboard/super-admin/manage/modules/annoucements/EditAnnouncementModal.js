// src/app/dashboard/super-admin/manage/modules/announcements/EditAnnouncementModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import CheckboxMultiSelect from "@/components/admin/CheckboxMultiSelect";

export default function EditAnnouncementModal({
  open,
  onClose,
  announcementId,
  onUpdated,
}) {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [initial, setInitial] = useState(null);
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
    if (!open || !announcementId) return;

    (async () => {
      try {
        const [cRes, aRes, mRes, annRes] = await Promise.all([
          fetch("/api/super-admin/cities", { credentials: "include" }),
          fetch("/api/super-admin/areas?limit=2000", {
            credentials: "include",
          }),
          fetch("/api/super-admin/masjids?limit=5000", {
            credentials: "include",
          }),
          fetch(`/api/super-admin/general-announcements/${announcementId}`, {
            credentials: "include",
          }),
        ]);

        const citiesData = await cRes.json();
        const areasData = await aRes.json();
        const masjidsData = await mRes.json();
        const annData = await annRes.json();

        const a = annData?.data;
        if (!a) return;

        setCities(citiesData?.data || []);
        setAreas(areasData?.data || []);
        setMasjids(masjidsData?.data || []);
        setInitial(a);

        setForm({
          title: a.title || "",
          body: a.body || "",
          startDate: a.startDate?.substring(0, 10) || "",
          endDate: a.endDate?.substring(0, 10) || "",
          cityIds: (a.cities || []).map(String),
          areaIds: (a.areas || []).map(String),
          masjidIds: (a.masjids || []).map(String),
          images: Array.isArray(a.images) ? a.images : [],
        });
      } catch (err) {
        console.error("EditAnnouncement load error:", err);
      }
    })();
  }, [open, announcementId]);

  if (!open || !initial) return null;

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

  async function handleSubmit(status = initial.status) {
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

    const res = await fetch(
      `/api/super-admin/general-announcements/${announcementId}`,
      {
        method: "PUT",
        credentials: "include",
        body: fd,
      },
    );

    const data = await res.json();

    if (data?.success) {
      const detailRes = await fetch(
        `/api/super-admin/general-announcements/${announcementId}`,
        { credentials: "include" },
      );
      const detail = await detailRes.json();

      notify.success(
        status === "published" ? "Announcement Published" : "Draft Updated",
      );
      onUpdated?.(detail.data);
      onClose();
    } else {
      notify.error(data?.message || "Update failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Announcement" size="lg">
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border px-3 py-2 rounded"
          rows={4}
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

        {/* Existing images */}
        {!!form.images.length && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((url) => (
              <div key={url} className="relative w-24 h-24 border rounded">
                <img src={url} className="w-full h-full object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      images: s.images.filter((x) => x !== url),
                    }))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload new images */}
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
