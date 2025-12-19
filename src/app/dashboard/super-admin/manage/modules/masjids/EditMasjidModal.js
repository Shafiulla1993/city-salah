// src/app/dashboard/super-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerRulesForm from "./PrayerRulesForm";
import MasjidLocationPicker from "./MasjidLocationPicker";
import { notify } from "@/lib/toast";
import { uploadMasjidImage } from "@/lib/helpers/uploads";
import { adminAPI } from "@/lib/api/sAdmin";

export default function EditMasjidModal({
  open,
  onClose,
  masjidId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    contacts: {},
    description: "",
    timezone: "Asia/Kolkata",
  });

  const [image, setImage] = useState({
    file: null,
    url: "",
    publicId: "",
  });

  const [prayerRules, setPrayerRules] = useState({});

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  /* ---------------- LOAD MASJID ---------------- */
  useEffect(() => {
    if (!open || !masjidId) return;

    async function load() {
      setLoading(true);
      try {
        const res = await adminAPI.getMasjidById(masjidId);
        const m = res?.data;
        if (!m) return;

        setForm({
          name: m.name || "",
          address: m.address || "",
          lat: m.location?.coordinates?.[1] || "",
          lng: m.location?.coordinates?.[0] || "",
          contacts: {
            imam: m.contacts?.find((c) => c.role === "imam") || {},
            mozin: m.contacts?.find((c) => c.role === "mozin") || {},
            mutawalli: m.contacts?.find((c) => c.role === "mutawalli") || {},
          },
          description: m.description || "",
          timezone: m.timezone || "Asia/Kolkata",
        });

        setImage({
          file: null,
          url: m.imageUrl || "",
          publicId: m.imagePublicId || "",
        });

        const t = m.prayerTimings?.[0] || {};
        setPrayerRules({
          fajr: t.fajr || {},
          zohar: t.zohar || {},
          asr: t.asr || {},
          maghrib: t.maghrib || {},
          isha: t.isha || {},
          juma: t.juma || {},
        });
      } catch {
        notify.error("Failed to load masjid");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, masjidId]);

  /* ---------------- IMAGE UPLOAD ---------------- */
  async function onImageSelect(file) {
    if (!file) return;
    try {
      setLoading(true);
      const res = await uploadMasjidImage(file);
      setImage({
        file,
        url: res.imageUrl,
        publicId: res.imagePublicId,
      });
      notify.success("Image uploaded");
    } catch {
      notify.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- SUBMIT ---------------- */
  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        image: {
          imageUrl: form.imageUrl,
          imagePublicId: form.imagePublicId,
        },

        contacts: Object.entries(form.contacts || {})
          .filter(([, v]) => v?.name?.trim())
          .map(([role, v]) => ({
            role,
            name: v.name.trim(),
            phone: v.phone || "",
            email: v.email || "",
            note: v.note || "",
          })),

        prayerRules: form.prayerRules, // 🔑 BATCH
      };

      const res = await adminAPI.updateMasjid(masjidId, payload);
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
    <>
      <Modal open={open} onClose={onClose} title="Edit Masjid" size="2xl">
        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <Input label="Masjid Name" value={form.name} disabled />

            <Input
              label="Address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />

            {/* IMAGE */}
            <div>
              <label className="block mb-1 font-medium">Masjid Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageSelect(e.target.files?.[0])}
              />
              {image.url && (
                <img
                  src={image.url}
                  className="mt-2 w-full max-h-40 object-cover rounded"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                value={form.lat}
                onChange={(e) => update("lat", e.target.value)}
              />
              <Input
                label="Longitude"
                value={form.lng}
                onChange={(e) => update("lng", e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="bg-blue-600 text-white py-2 rounded w-full"
            >
              Change Location
            </button>

            <ContactPersonsForm
              contacts={form.contacts}
              onChange={(v) => update("contacts", v)}
            />

            <PrayerRulesForm value={prayerRules} onChange={setPrayerRules} />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="bg-slate-700 text-white px-4 py-2 rounded"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <MasjidLocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={form.lat}
        lng={form.lng}
        onSelect={(lat, lng) => {
          update("lat", lat);
          update("lng", lng);
        }}
      />
    </>
  );
}
