// src/app/dashboard/super-admin/manage/modules/areas/EditAreaModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function EditAreaModal({ open, onClose, areaId, onUpdated }) {
  const [cities, setCities] = useState([]);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!open || !areaId) return;

    (async () => {
      try {
        const [cityRes, areaRes] = await Promise.all([
          fetch("/api/super-admin/cities", { credentials: "include" }),
          fetch(`/api/super-admin/areas/${areaId}`, { credentials: "include" }),
        ]);

        const citiesData = await cityRes.json();
        const areaData = await areaRes.json();

        const a = areaData?.data;
        if (!a) return;

        setCities(citiesData?.data || []);
        setInitial(a);

        setForm({
          name: a.name || "",
          city: a.city?._id || "",
          lat: a.center?.coordinates?.[1] ?? "",
          lng: a.center?.coordinates?.[0] ?? "",
        });
      } catch (err) {
        console.error("EditArea load error:", err);
      }
    })();
  }, [open, areaId]);

  if (!open || !initial) return null; // 🔒 prevent render until data ready

  async function handleSubmit() {
    const payload = {};

    if (form.name !== initial.name) payload.name = form.name;
    if (form.city !== initial.city?._id) payload.city = form.city;

    if (
      Number(form.lat) !== initial.center?.coordinates?.[1] ||
      Number(form.lng) !== initial.center?.coordinates?.[0]
    ) {
      payload.center = {
        type: "Point",
        coordinates: [Number(form.lng), Number(form.lat)],
      };
    }

    try {
      const res = await fetch(`/api/super-admin/areas/${areaId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.success) {
        // 🔁 re-fetch populated
        const detailRes = await fetch(`/api/super-admin/areas/${areaId}`, {
          credentials: "include",
        });
        const detail = await detailRes.json();

        notify.success("Area updated");
        onUpdated?.(detail.data); // populated city
        onClose();
      } else {
        notify.error(data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Update failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Area" size="sm">
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="w-full border px-3 py-2 rounded"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
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
          Save changes
        </button>
      </div>
    </Modal>
  );
}
