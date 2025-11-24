// src/app/dashboard/super-admin/manage/modules/areas/EditAreaModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function EditAreaModal({ open, onClose, areaId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [initial, setInitial] = useState(null);

  const [form, setForm] = useState({
    name: "",
    city: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!open) return;
    loadData();
  }, [open]);

  async function loadData() {
    try {
      const [cityRes, areaRes] = await Promise.all([
        adminAPI.getCities(),
        adminAPI.getAreaById(areaId),
      ]);

      setCities(cityRes?.data ?? []);

      if (areaRes?.data) {
        const a = areaRes.data;

        setInitial(a);

        setForm({
          name: a.name,
          city: a.city?._id || "",
          lat: a.center?.coordinates?.[1] ?? "",
          lng: a.center?.coordinates?.[0] ?? "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit() {
    setLoading(true);

    const payload = {};

    if (form.name !== initial.name) payload.name = form.name;
    if (form.city !== (initial.city?._id || "")) payload.city = form.city;

    if (
      Number(form.lat) !== initial.center?.coordinates?.[1] ||
      Number(form.lng) !== initial.center?.coordinates?.[0]
    ) {
      payload.center = {
        type: "Point",
        coordinates: [Number(form.lng), Number(form.lat)],
      };
    }

    const res = await adminAPI.updateArea(areaId, payload);

    if (res?.success) {
      notify.success("Area updated");
      onUpdated?.(res.data);
      onClose();
    } else {
      notify.error(res?.message || "Update failed");
    }

    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Area" size="sm">
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <select
          className="w-full border px-3 py-2 rounded"
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

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => update("lat", e.target.value)}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => update("lng", e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-slate-700 text-white rounded px-4 py-2"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}
