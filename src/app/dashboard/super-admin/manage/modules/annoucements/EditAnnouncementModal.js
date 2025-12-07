// src/app/dashboard/super-admin/manage/modules/announcements/EditAnnouncementModal.js

"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";
import CheckboxMultiSelect from "@/components/admin/CheckboxMultiSelect";

export default function EditAnnouncementModal({
  open,
  onClose,
  announcementId,
  onUpdated,
  cities = [],
  areas = [],
  masjids = [],
}) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    startDate: "",
    endDate: "",
    cityIds: [],
    areaIds: [],
    masjidIds: [],
    keepImages: [],
    newImages: [],
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (open && announcementId) load();
  }, [open, announcementId]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminAPI.getAnnouncementById(announcementId);
      const a = res?.data;
      if (a) {
        setInitial(a);
        setForm({
          title: a.title || "",
          body: a.body || "",
          startDate: a.startDate?.substring(0, 10) || "",
          endDate: a.endDate?.substring(0, 10) || "",
          cityIds: (a.cities || []).map(String),
          areaIds: (a.areas || []).map(String),
          masjidIds: (a.masjids || []).map(String),
          keepImages: Array.isArray(a.images) ? a.images : [],
          newImages: [],
        });
      }
    } catch {
      notify.error("Failed to load announcement");
    } finally {
      setLoading(false);
    }
  }

  function toggleRemoveExistingImage(url) {
    update(
      "keepImages",
      form.keepImages.includes(url)
        ? form.keepImages.filter((u) => u !== url)
        : form.keepImages
    );
  }

  async function submit(e) {
    e.preventDefault();
    if (!initial) return;

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);

    form.cityIds.forEach((id) => fd.append("cities[]", id));
    form.areaIds.forEach((id) => fd.append("areas[]", id));
    form.masjidIds.forEach((id) => fd.append("masjids[]", id));

    fd.append("images", JSON.stringify(form.keepImages));
    form.newImages.forEach((file) => fd.append("images", file));

    setLoading(true);
    try {
      const res = await adminAPI.updateAnnouncement(announcementId, fd);
      if (res?.success) {
        notify.success("Announcement updated");
        onUpdated?.();
        onClose();
      } else notify.error(res?.message || "Update failed");
    } catch {
      notify.error("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Announcement" size="lg">
      {!initial ? (
        <div className="py-10 text-center text-gray-500">Loading…</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {/* Input fields */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            rows={4}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
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

          {/* Select groups */}
          <CheckboxMultiSelect
            label="Cities"
            items={cities}
            selected={form.cityIds}
            onChange={(v) => update("cityIds", v)}
          />
          <CheckboxMultiSelect
            label="Areas"
            items={areas}
            selected={form.areaIds}
            onChange={(v) => update("areaIds", v)}
          />
          <CheckboxMultiSelect
            label="Masjids"
            items={masjids}
            selected={form.masjidIds}
            onChange={(v) => update("masjidIds", v)}
          />

          {/* Existing images */}
          {!!form.keepImages.length && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Existing images</label>
              <div className="flex flex-wrap gap-3">
                {form.keepImages.map((url) => (
                  <div
                    key={url}
                    className="relative border rounded-lg overflow-hidden w-24 h-24"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleRemoveExistingImage(url)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-1 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New images */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              update("newImages", Array.from(e.target.files || []))
            }
            className="text-sm"
          />

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
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
