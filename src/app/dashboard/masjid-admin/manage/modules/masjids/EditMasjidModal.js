// src/app/dashboard/masjid-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { mAdminAPI } from "@/lib/api/mAdmin";
import { notify } from "@/lib/toast";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerTimingsForm from "./PrayerTimingsForm";

export default function EditMasjidModal({
  open,
  onClose,
  masjidId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);

  const initialForm = {
    image: null,
    imageUrl: "",
    contacts: {},
    prayerTimings: {},
  };

  const [form, setForm] = useState(initialForm);

  function update(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function load() {
    if (!masjidId) return;
    setLoading(true);
    try {
      const { data: m } = await mAdminAPI.getMasjidById(masjidId);
      setForm({
        image: null,
        imageUrl: m.imageUrl || "",
        contacts: {
          imam: m.contacts?.find((c) => c.role === "imam") || {},
          mozin: m.contacts?.find((c) => c.role === "mozin") || {},
          mutawalli: m.contacts?.find((c) => c.role === "mutawalli") || {},
        },
        prayerTimings: m.prayerTimings?.[0] || {},
      });
    } catch {
      notify.error("Failed to load masjid");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open, masjidId]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const contactsArray = [
        ...(form.contacts.imam?.name
          ? [{ role: "imam", ...form.contacts.imam }]
          : []),
        ...(form.contacts.mozin?.name
          ? [{ role: "mozin", ...form.contacts.mozin }]
          : []),
        ...(form.contacts.mutawalli?.name
          ? [{ role: "mutawalli", ...form.contacts.mutawalli }]
          : []),
      ];
      const timingsArray = [form.prayerTimings];

      const fd = new FormData();
      fd.append("contacts", JSON.stringify(contactsArray));
      fd.append("prayerTimings", JSON.stringify(timingsArray));
      if (form.image) fd.append("image", form.image);

      const res = await mAdminAPI.updateMasjid(masjidId, fd);

      if (res?.success) {
        notify.success("Masjid updated");
        onUpdated?.();
        onClose();
      } else notify.error(res?.message || "Update failed");
    } catch {
      notify.error("Failed to update masjid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Masjid" size="2xl">
      {!open || loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="mb-1 font-medium block">Image</label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                className="w-full max-h-32 object-cover rounded mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update("image", e.target.files?.[0] || null)}
            />
          </div>

          <ContactPersonsForm
            contacts={form.contacts}
            onChange={(v) => update("contacts", v)}
          />

          <PrayerTimingsForm
            value={form.prayerTimings}
            onChange={(v) => update("prayerTimings", v)}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
