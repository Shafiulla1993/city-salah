// src/app/dashboard/masjid-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerRulesForm from "./PrayerRulesForm";

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
    contacts: {
      imam: {},
      mozin: {},
      mutawalli: {},
    },
    prayerRules: {},
    ladiesPrayerFacility: false,
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ---------------- LOAD MASJID ---------------- */
  useEffect(() => {
    if (!open || !masjidId) return;

    async function load() {
      setLoading(true);
      try {
        const [masjidRes, rulesRes] = await Promise.all([
          adminAPI.getMasjidById(masjidId),
          adminAPI.getMasjidPrayerRules(masjidId),
        ]);

        const m = masjidRes?.data;
        const config = rulesRes?.data;
        const normalizedRules = {};

        (config?.rules || []).forEach((r) => {
          normalizedRules[r.prayer] = {
            mode: r.mode,
            manual: r.manual || {},
            auto: r.auto || {},
          };
        });

        setForm({
          imageUrl: m?.imageUrl || "",
          imagePublicId: m?.imagePublicId || "",
          ladiesPrayerFacility: Boolean(m.ladiesPrayerFacility),
          contacts: {
            imam: m?.contacts?.find((c) => c.role === "imam") || {},
            mozin: m?.contacts?.find((c) => c.role === "mozin") || {},
            mutawalli: m?.contacts?.find((c) => c.role === "mutawalli") || {},
          },
          prayerRules: normalizedRules,
        });
      } catch (err) {
        notify.error("Failed to load masjid");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, masjidId]);

  /* ---------------- IMAGE ---------------- */
  async function onImageSelect(file) {
    if (!file) return;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("image", file);

      // 1️⃣ Upload image
      const uploaded = await adminAPI.uploadMasjidImage(fd);

      if (!uploaded?.data?.imageUrl) {
        throw new Error("Image upload failed");
      }

      const payload = {
        imageUrl: uploaded.data.imageUrl,
        imagePublicId: uploaded.data.imagePublicId,
      };

      // 2️⃣ Attach image to masjid
      await adminAPI.updateMasjid(masjidId, payload);

      // 3️⃣ Update local state
      setForm((prev) => ({ ...prev, ...payload }));

      notify.success("Image updated");
    } catch (err) {
      notify.error(err.message || "Image update failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- SUBMIT ---------------- */
  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      /* 1️⃣ Update masjid metadata */
      await adminAPI.updateMasjid(masjidId, {
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
        ladiesPrayerFacility: form.ladiesPrayerFacility,
        contacts: Object.entries(form.contacts)
          .filter(([, v]) => v?.name)
          .map(([role, v]) => ({ role, ...v })),
      });

      /* 2️⃣ Upsert prayer rules (ONE BY ONE) */
      for (const [prayer, rule] of Object.entries(form.prayerRules)) {
        if (!rule?.mode) continue;

        await adminAPI.upsertMasjidPrayerRule(masjidId, {
          prayer,
          mode: rule.mode,
          manual: rule.manual,
          auto: rule.auto,
        });
      }

      notify.success("Masjid updated successfully");
      onUpdated?.(true);
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

          {/* LADIES PRAYER FACILITY */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ladiesPrayerFacility"
              checked={form.ladiesPrayerFacility}
              onChange={(e) => update("ladiesPrayerFacility", e.target.checked)}
              className="h-4 w-4"
            />
            <label
              htmlFor="ladiesPrayerFacility"
              className="text-sm font-medium"
            >
              Ladies prayer facility available
            </label>
          </div>

          {/* CONTACTS */}
          <ContactPersonsForm
            contacts={form.contacts}
            onChange={(v) => update("contacts", v)}
          />

          {/* PRAYER RULES */}
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
