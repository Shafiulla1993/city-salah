// src/app/dashboard/masjid-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { mAdminAPI } from "@/lib/api/mAdmin";
import { notify } from "@/lib/toast";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerRulesForm from "@/app/dashboard/super-admin/manage/modules/masjids/PrayerRulesForm";

export default function EditMasjidModal({
  open,
  onClose,
  masjidId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    imageUrl: "",
    imagePublicId: "",
    contacts: {},
    prayerRules: {},
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ---------- LOAD MASJID ---------- */
  useEffect(() => {
    if (!open || !masjidId) return;

    async function load() {
      setLoading(true);
      try {
        const res = await mAdminAPI.getMasjidById(masjidId);
        const m = res?.data;
        if (!m) throw new Error("No masjid data");

        /**
         * Convert prayerTimings → editable rules shape
         */
        const timings = m.prayerTimings?.[0] || {};
        const normalizedRules = {};

        Object.entries(timings).forEach(([prayer, data]) => {
          if (!data) return;

          if (prayer === "maghrib") {
            normalizedRules.maghrib = {
              mode: "auto",
              auto: {
                azan_offset_minutes: data.azan === "AUTO" ? 0 : 0,
                iqaamat_offset_minutes: data.iqaamat === "AUTO" ? 0 : 0,
              },
            };
          } else {
            normalizedRules[prayer] = {
              mode: "manual",
              manual: {
                azan: data.azan || "",
                iqaamat: data.iqaamat || "",
              },
            };
          }
        });

        setForm({
          imageUrl: m.imageUrl || "",
          imagePublicId: m.imagePublicId || "",
          contacts: {
            imam: m.contacts?.find((c) => c.role === "imam") || {},
            mozin: m.contacts?.find((c) => c.role === "mozin") || {},
            mutawalli: m.contacts?.find((c) => c.role === "mutawalli") || {},
          },
          prayerRules: normalizedRules,
        });
      } catch (err) {
        console.error("EditMasjidModal load error:", err);
        notify.error("Failed to load masjid");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, masjidId]);

  /* ---------- IMAGE ---------- */
  async function onImageSelect(file) {
    if (!file) return;

    try {
      setLoading(true);

      // 1️⃣ Upload (multipart)
      const uploaded = await mAdminAPI.uploadMasjidImage(file);

      console.log("Uploaded image:", uploaded); // 🔍 DEBUG

      // 🔴 IMPORTANT: uploaded MUST contain imageUrl
      if (!uploaded?.data?.imageUrl) {
        throw new Error("Upload did not return imageUrl");
      }

      const payload = {
        imageUrl: uploaded.data.imageUrl,
        imagePublicId: uploaded.data.imagePublicId,
      };

      console.log("Saving image payload:", payload); // 🔍 DEBUG

      // 2️⃣ Save (JSON)
      await mAdminAPI.updateMasjidImage(masjidId, payload);

      // 3️⃣ Update local state (preview + submit)
      setForm((prev) => ({
        ...prev,
        imageUrl: payload.imageUrl,
        imagePublicId: payload.imagePublicId,
      }));

      notify.success("Image updated");
    } catch (err) {
      console.error(err);
      notify.error(err.message || "Image update failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- SUBMIT ---------- */
  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
        contacts: Object.entries(form.contacts)
          .filter(([, v]) => v?.name)
          .map(([role, v]) => ({ role, ...v })),
        prayerRules: form.prayerRules,
      };

      const res = await mAdminAPI.updateMasjid(masjidId, payload);
      if (!res?.success) throw new Error(res.message);

      notify.success("Masjid updated");
      onUpdated?.(res.data);
      onClose();
    } catch (err) {
      notify.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Masjid" size="2xl">
      {loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          {/* IMAGE */}
          <div>
            <label className="block mb-1 font-medium">Masjid Image</label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                className="w-full max-h-40 object-cover rounded mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageSelect(e.target.files?.[0])}
            />
          </div>

          {/* CONTACTS */}
          <ContactPersonsForm
            contacts={form.contacts}
            onChange={(v) => update("contacts", v)}
          />

          {/* PRAYERS */}

          <PrayerRulesForm
            value={form.prayerRules}
            onChange={(v) => update("prayerRules", v)}
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
              Save Changes
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
