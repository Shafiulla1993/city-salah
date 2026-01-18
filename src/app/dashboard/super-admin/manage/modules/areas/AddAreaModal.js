// src/app/dashboard/super-admin/manage/modules/areas/AddAreaModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";
import AddCityModal from "../cities/AddCityModal";

export default function AddAreaModal({ open, onClose, onCreated }) {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", lat: "", lng: "" });
  const [openCityModal, setOpenCityModal] = useState(false);

  useEffect(() => {
    if (!open) return;

    // reset form on open
    setForm({ name: "", city: "", lat: "", lng: "" });

    (async () => {
      const res = await fetch("/api/super-admin/cities", {
        credentials: "include",
      });
      const data = await res.json();
      setCities(data?.data || []);
    })();
  }, [open]);

  async function handleSubmit() {
    const res = await fetch("/api/super-admin/areas", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        city: form.city,
        center: {
          type: "Point",
          coordinates: [Number(form.lng), Number(form.lat)],
        },
      }),
    });

    const data = await res.json();

    if (data?.success) {
      // re-fetch populated area
      const detailRes = await fetch(`/api/super-admin/areas/${data.data._id}`, {
        credentials: "include",
      });
      const detail = await detailRes.json();

      notify.success("Area created");
      onCreated?.(detail.data);

      setForm({ name: "", city: "", lat: "", lng: "" });
      onClose();
    } else {
      notify.error(data?.message || "Failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Area" size="sm">
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Area Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="w-full border px-3 py-2 rounded"
          value={form.city}
          onChange={(e) => {
            if (e.target.value === "__add_new__") {
              setOpenCityModal(true);
              return;
            }
            setForm({ ...form, city: e.target.value });
          }}
        >
          <option value="">Select City</option>

          <option
            value="__add_new__"
            className="font-semibold text-emerald-700"
          >
            + Add New City
          </option>

          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <AddCityModal
          open={openCityModal}
          onClose={() => setOpenCityModal(false)}
          onCreated={(city) => {
            setCities((prev) => [city, ...prev]);
            setForm((f) => ({ ...f, city: city._id }));
            setOpenCityModal(false);
          }}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
        />

        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => setForm({ ...form, lng: e.target.value })}
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
