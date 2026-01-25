// src/app/dashboard/masjid-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
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
    address: "",
    contacts: {},
    prayerRules: {},
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ---------- LOAD MASJID ---------- */
  useEffect(() => {
    if (!open || !masjidId) return;

    (async () => {
      try {
        setLoading(true);

        const [mRes, rRes] = await Promise.all([
          fetch(`/api/masjid-admin/masjids/${masjidId}`, {
            credentials: "include",
          }).then((r) => r.json()),
          fetch(`/api/masjid-admin/masjids/${masjidId}/prayer-rules`, {
            credentials: "include",
          }).then((r) => r.json()),
        ]);

        const m = mRes.data;

        const rulesArr = rRes?.data?.rules || [];
        const normalizedRules = {};

        rulesArr.forEach((r) => {
          normalizedRules[r.prayer] = {
            mode: r.mode,
            manual: r.manual
              ? {
                  azan: r.manual.azan || "",
                  iqaamat: r.manual.iqaamat || "",
                }
              : undefined,
            auto: r.auto,
          };
        });

        setForm({
          imageUrl: m.imageUrl || "",
          imagePublicId: m.imagePublicId || "",
          address: m.address || "",
          contacts: Object.fromEntries(
            (m.contacts || []).map((c) => [c.role, c]),
          ),
          prayerRules: normalizedRules,
        });
      } catch (err) {
        console.error(err);
        notify.error("Failed to load masjid");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, masjidId]);

  /* ---------- IMAGE ---------- */
  async function onImageSelect(file) {
    if (!file) return;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("image", file);

      const uploadRes = await fetch("/api/masjid-admin/masjids/upload-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const uploaded = await uploadRes.json();

      const payload = {
        imageUrl: uploaded.data.imageUrl,
        imagePublicId: uploaded.data.imagePublicId,
      };

      await fetch(`/api/masjid-admin/masjids/${masjidId}/image`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(payload),
      });

      setForm((prev) => ({ ...prev, ...payload }));
      notify.success("Image updated");
    } catch (err) {
      console.error(err);
      notify.error("Image update failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- SUBMIT ---------- */
  async function submit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. Update address + contacts
      await fetch(`/api/masjid-admin/masjids/${masjidId}/update`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({
          address: form.address,
          contacts: Object.entries(form.contacts)
            .filter(([, v]) => v?.name)
            .map(([role, v]) => ({ role, ...v })),
        }),
      });

      // 2. Update prayer rules
      for (const [prayer, rule] of Object.entries(form.prayerRules)) {
        await fetch(`/api/masjid-admin/masjids/${masjidId}/prayer-rules`, {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({ prayer, ...rule }),
        });
      }

      notify.success("Masjid updated");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      notify.error("Update failed");
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

          {/* ADDRESS */}
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <textarea
              className="border rounded w-full p-2"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
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
