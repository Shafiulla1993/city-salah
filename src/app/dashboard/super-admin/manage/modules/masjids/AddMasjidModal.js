// src/app/dashboard/super-admin/manage/modules/masjids/AddMasjidModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function AddMasjidModal({ open, onClose, onCreated }) {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    area: "",
    address: "",
    location: { coordinates: [0, 0] },
  });

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          adminAPI.getCities(),
          adminAPI.getAreas("?limit=1000"),
        ]);

        setCities(cRes?.data ?? []);
        setAreas(aRes?.data ?? []);
      } catch (err) {
        console.error("Failed loading dropdowns", err);
      }
    })();
  }, [open]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await adminAPI.createMasjid(form);
      if (res?.success) {
        notify.success("Masjid created");
        onCreated?.();
        onClose();
      } else notify.error(res?.message);
    } catch (err) {
      notify.error("Failed to create masjid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Masjid">
      <div className="space-y-4">
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Masjid name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* City */}
        <select
          className="border px-3 py-2 w-full rounded"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        >
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Area */}
        <select
          className="border px-3 py-2 w-full rounded"
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        >
          <option value="">Select area</option>
          {areas
            .filter((a) => a.city?._id === form.city)
            .map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
        </select>

        <button
          className="btn btn-primary w-full"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Saving…" : "Create"}
        </button>
      </div>
    </Modal>
  );
}
