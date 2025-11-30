// src/app/dashboard/super-admin/manage/modules/masjids/AddMasjidModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { adminAPI } from "@/lib/api/sAdmin";
import PrayerTimingsForm from "./PrayerTimingsForm";
import ContactPersonsForm from "./ContactPersonsForm";
import { notify } from "@/lib/toast";
import MasjidLocationPicker from "./MasjidLocationPicker";

export default function AddMasjidModal({ open, onClose, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [mapOpen, setMapOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    area: "",
    locationLat: "",
    locationLng: "",
    image: null,
    contacts: {},
    prayerTimings: {},
    description: "",
    timezone: "",
  });

  function update(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function loadLists() {
    const [c, a] = await Promise.all([
      adminAPI.getCities(),
      adminAPI.getAreas("?limit=2000"),
    ]);
    setCities(c?.data || []);
    setAreas(a?.data || []);
  }

  useEffect(() => {
    if (open) loadLists();
  }, [open]);

  const filteredAreas = areas.filter(
    (a) => !form.city || a.city?._id === form.city
  );

  async function submit(e) {
    e.preventDefault();

    // REQUIRED VALIDATIONS
    if (!form.name.trim()) return notify.error("Masjid name is required");
    if (!form.city) return notify.error("City is required");
    if (!form.area) return notify.error("Area is required");
    if (!form.locationLat || !form.locationLng)
      return notify.error("Masjid location is required");
    if (!form.contacts?.imam?.name?.trim())
      return notify.error("Imam name is required");

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        area: form.area,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(form.locationLng),
            parseFloat(form.locationLat),
          ],
        },
        contacts: [
          ...(form.contacts.imam?.name
            ? [{ role: "imam", ...form.contacts.imam }]
            : []),
          ...(form.contacts.mozin?.name
            ? [{ role: "mozin", ...form.contacts.mozin }]
            : []),
          ...(form.contacts.mutawalli?.name
            ? [{ role: "mutawalli", ...form.contacts.mutawalli }]
            : []),
        ],
        prayerTimings: [form.prayerTimings],
        description: form.description || "",
        timezone: form.timezone || "",
      };

      const fd = new FormData();
      Object.keys(payload).forEach((k) =>
        fd.append(
          k,
          typeof payload[k] === "object"
            ? JSON.stringify(payload[k])
            : payload[k]
        )
      );
      if (form.image) fd.append("image", form.image);

      const res = await adminAPI.addMasjid(fd);
      if (res?.success) {
        notify.success("Masjid added successfully");
        onAdded?.(res.data);
        onClose();
      } else notify.error(res?.message || "Failed");
    } catch {
      notify.error("Failed to add masjid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Add Masjid" size="2xl">
        <form onSubmit={submit} className="space-y-6">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />

            <div>
              <label className="block mb-1 font-medium">City *</label>
              <select
                className="border w-full px-3 py-2 rounded-lg"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              >
                <option value="">Select</option>
                {cities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Area *</label>
              <select
                className="border w-full px-3 py-2 rounded-lg"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
              >
                <option value="">Select</option>
                {filteredAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Latitude *"
              value={form.locationLat}
              onChange={(e) => update("locationLat", e.target.value)}
            />
            <Input
              label="Longitude *"
              value={form.locationLng}
              onChange={(e) => update("locationLng", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="border bg-blue-600 text-white py-2 rounded-lg col-span-1 md:col-span-2"
            >
              Pick Location on Map
            </button>

            <Input
              label="Timezone"
              value={form.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {/* CONTACT INFO */}
          <ContactPersonsForm
            contacts={form.contacts}
            onChange={(v) => update("contacts", v)}
          />

          {/* PRAYER TIMES */}
          <PrayerTimingsForm
            value={form.prayerTimings}
            onChange={(v) => update("prayerTimings", v)}
          />

          {/* IMAGE */}
          <div>
            <label className="block mb-1 font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update("image", e.target.files?.[0] || null)}
            />
          </div>

          {/* SUBMIT */}
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
              {loading ? "Saving..." : "Add Masjid"}
            </button>
          </div>
        </form>
      </Modal>

      <MasjidLocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={form.locationLat}
        lng={form.locationLng}
        onSelect={(lat, lng) => {
          update("locationLat", lat);
          update("locationLng", lng);
        }}
      />
    </>
  );
}
