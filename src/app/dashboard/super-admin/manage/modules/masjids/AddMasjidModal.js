// src/app/dashboard/super-admin/manage/modules/masjids/AddMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { adminAPI } from "@/lib/api/sAdmin";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerRulesForm from "./PrayerRulesForm";
import MasjidLocationPicker from "./MasjidLocationPicker";
import { notify } from "@/lib/toast";
import { uploadMasjidImage } from "@/lib/helpers/uploads";

export default function AddMasjidModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [prayerRules, setPrayerRules] = useState({});

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    area: "",
    lat: "",
    lng: "",
    contacts: {},
    description: "",
    timezone: "Asia/Kolkata",
  });

  const [image, setImage] = useState({
    url: "",
    publicId: "",
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  /* -------- load city/area -------- */
  useEffect(() => {
    if (!open) return;

    Promise.all([
      adminAPI.getCities("?limit=1000"),
      adminAPI.getAreas("?limit=2000"),
    ]).then(([c, a]) => {
      setCities(c?.data || []);
      setAreas(a?.data || []);
    });
  }, [open]);

  const filteredAreas = areas.filter(
    (a) => !form.city || a.city?._id === form.city
  );

  /* -------- image upload -------- */
  async function onImageSelect(file) {
    if (!file) return;

    try {
      setLoading(true);

      const res = await uploadMasjidImage(file);

      // 🔥 THIS IS THE KEY LINE
      setImage({
        file,
        url: res.imageUrl,
        publicId: res.imagePublicId,
      });

      notify.success("Image uploaded successfully");
    } catch (err) {
      console.error(err);
      notify.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  }

  /* -------- submit -------- */
  async function submit(e) {
    e.preventDefault();

    if (!form.name.trim()) return notify.error("Masjid name is required");
    if (!form.city) return notify.error("City is required");
    if (!form.area) return notify.error("Area is required");
    if (!form.lat || !form.lng)
      return notify.error("Latitude & Longitude required");

    setLoading(true);

    try {
      /* ---------- 1️⃣ CREATE MASJID ---------- */
      const payload = {
        name: form.name.trim(),
        address: form.address || "",
        city: form.city,
        area: form.area,
        description: form.description || "",
        timezone: form.timezone || "Asia/Kolkata",
        location: {
          type: "Point",
          coordinates: [Number(form.lng), Number(form.lat)],
        },
        contacts: Object.entries(form.contacts)
          .filter(([, v]) => v?.name)
          .map(([role, v]) => ({ role, ...v })),

        imageUrl: image.url || "",
        imagePublicId: image.publicId || "",
      };

      console.log("IMAGE STATE BEFORE SUBMIT:", image);

      const res = await adminAPI.createMasjid(payload);
      if (!res?.success) throw new Error(res.message);

      const masjidId = res.data._id;

      /* ---------- 2️⃣ SAVE PRAYER RULES ---------- */
      for (const [prayer, data] of Object.entries(prayerRules)) {
        if (!data) continue;

        if (prayer === "maghrib") {
          await adminAPI.upsertMasjidPrayerRule(masjidId, {
            prayer: "maghrib",
            mode: "auto",
            auto: {
              source: "auqatus_salah",
              azan_offset_minutes: Number(data.azanOffset || 0),
              iqaamat_offset_minutes: Number(data.iqaamatOffset || 0),
            },
          });
        } else {
          await adminAPI.upsertMasjidPrayerRule(masjidId, {
            prayer,
            mode: "manual",
            manual: {
              azan: data.azan || "",
              iqaamat: data.iqaamat || "",
            },
          });
        }
      }

      notify.success("Masjid created successfully");
      onCreated?.(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      notify.error(err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Add Masjid" size="2xl">
        <form onSubmit={submit} className="space-y-6">
          <Input
            label="Masjid Name *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

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

          {/* CITY / AREA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border px-3 py-2 rounded"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="border px-3 py-2 rounded"
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
            >
              <option value="">Select Area</option>
              {filteredAreas.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* LAT / LNG */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude *"
              value={form.lat}
              onChange={(e) => update("lat", e.target.value)}
            />
            <Input
              label="Longitude *"
              value={form.lng}
              onChange={(e) => update("lng", e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="bg-blue-600 text-white py-2 rounded w-full"
          >
            Pick Location on Map
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
              {loading ? "Saving..." : "Add Masjid"}
            </button>
          </div>
        </form>
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
