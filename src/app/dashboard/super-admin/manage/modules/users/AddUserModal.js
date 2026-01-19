// src/app/dashboard/super-admin/manage/modules/users/AddUserModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import MultiSelect from "@/components/form/MultiSelect";
import { notify } from "@/lib/toast";

export default function AddUserModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "public",
    city: "",
    area: "",
    masjidId: [],
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/super-admin/cities").then((r) => r.json()),
      fetch("/api/super-admin/masjids").then((r) => r.json()),
    ]).then(([c, m]) => {
      setCities(c.data || []);
      setMasjids(m.data || []);
    });
  }, [open]);

  useEffect(() => {
    if (!form.city) return setAreas([]);
    fetch(`/api/super-admin/areas?city=${form.city}`)
      .then((r) => r.json())
      .then((a) => setAreas(a.data || []));
  }, [form.city]);

  async function submit(e) {
    e.preventDefault();

    if (!form.name || !form.phone || !form.email || !form.password)
      return notify.error("Name, phone, email and password are required");

    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        notify.success("User created");
        onCreated?.();
        onClose();
      } else notify.error(json.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create User" size="lg">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="public">Public</option>
            <option value="masjid_admin">Masjid Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">City</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Area</option>
            {areas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {form.role === "masjid_admin" && (
          <MultiSelect
            options={masjids.map((m) => ({ value: m._id, label: m.name }))}
            value={form.masjidId}
            onChange={(v) => update("masjidId", v)}
          />
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-slate-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
