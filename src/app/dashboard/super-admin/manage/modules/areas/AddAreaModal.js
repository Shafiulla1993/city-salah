// src/app/dashboard/super-admin/manage/modules/areas/AddAreaModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function AddAreaModal({ open, onClose, onCreated }) {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    name: "",
    city: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!open) return;
    loadCities();
  }, [open]);

  async function loadCities() {
    const res = await adminAPI.getCities();
    setCities(res?.data ?? []);
  }

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit() {
    const body = {
      name: form.name,
      city: form.city,
      center: {
        type: "Point",
        coordinates: [Number(form.lng), Number(form.lat)],
      },
    };

    const res = await adminAPI.createArea(body);

    if (res?.success) {
      notify.success("Area created");
      onCreated?.(res.data);
      onClose();
      setForm({ name: "", city: "", lat: "", lng: "" });
    } else {
      notify.error(res?.message || "Failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Area" size="sm">
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Area Name"
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
          className="w-full bg-slate-700 text-white rounded px-4 py-2"
        >
          Create Area
        </button>
      </div>
    </Modal>
  );
}
