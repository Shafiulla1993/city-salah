// src/app/dashboard/super-admin/manage/modules/masjids/EditMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { adminAPI } from "@/lib/api/sAdmin";
import PrayerTimingsForm from "./PrayerTimingsForm";
import { notify } from "@/lib/toast";

export default function EditMasjidModal({
  open,
  onClose,
  masjidId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    area: "",
    locationLat: "",
    locationLng: "",
    image: null,
    imageUrl: "",
    prayerTimings: {},
  });

  useEffect(() => {
    if (!open) return;
    loadMasjid();
    loadCityAreaLists();
  }, [open, masjidId]);

  async function loadCityAreaLists() {
    try {
      const [c, a] = await Promise.all([
        adminAPI.getCities(),
        adminAPI.getAreas("?limit=1000"),
      ]);
      setCities(c?.data || []);
      setAreas(a?.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMasjid() {
    setLoading(true);
    try {
      const res = await adminAPI.getMasjidById(masjidId);

      if (!res?.data) return;

      const m = res.data;
      setInitial(m);

      setForm({
        name: m.name,
        address: m.address || "",
        city: m.city?._id || "",
        area: m.area?._id || "",
        locationLat: m.location?.coordinates?.[1] || "",
        locationLng: m.location?.coordinates?.[0] || "",
        image: null,
        imageUrl: m.imageUrl || "",
        prayerTimings: m.prayerTimings?.[0] || {},
      });
    } catch (err) {
      console.error(err);
      notify.error("Failed to load masjid");
    } finally {
      setLoading(false);
    }
  }

  const filteredAreas = areas.filter(
    (a) => !form.city || a.city?._id === form.city
  );

  function update(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
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
        prayerTimings: [form.prayerTimings],
      };

      let res;
      if (form.image) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) =>
          fd.append(
            k,
            typeof payload[k] === "object"
              ? JSON.stringify(payload[k])
              : payload[k]
          )
        );
        fd.append("image", form.image);

        res = await adminAPI.updateMasjid(masjidId, fd);
      } else {
        res = await adminAPI.updateMasjid(masjidId, payload);
      }

      if (res?.success) {
        notify.success("Masjid updated");
        onUpdated(res.data);
        onClose();
      } else {
        notify.error(res?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to update masjid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Masjid" size="lg">
      <form onSubmit={submit} className="space-y-5">
        {!initial ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
              <Input
                label="Address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />

              <div>
                <label className="block mb-1 text-sm font-medium">City</label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full"
                >
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Area</label>
                <select
                  value={form.area}
                  onChange={(e) => update("area", e.target.value)}
                  className="border px-3 py-2 rounded-lg w-full"
                >
                  {filteredAreas.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Latitude"
                value={form.locationLat}
                onChange={(e) => update("locationLat", e.target.value)}
              />
              <Input
                label="Longitude"
                value={form.locationLng}
                onChange={(e) => update("locationLng", e.target.value)}
              />

              <div>
                <label className="mb-1 block text-sm font-medium">Image</label>
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    className="w-full max-h-28 rounded mb-2 object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => update("image", e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Prayer timings */}
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
          </>
        )}
      </form>
    </Modal>
  );
}
