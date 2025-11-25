// src/app/dashboard/super-admin/manage/modules/users/AddUserModal.js

"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { Select } from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import { adminAPI } from "@/lib/api/sAdmin";
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

  useEffect(() => {
    if (!open) return;
    fetchLists();
  }, [open]);

  async function fetchLists() {
    try {
      const c = await adminAPI.getCities();
      setCities(c?.data ?? []);
      const a = await adminAPI.getAreas();
      setAreas(a?.data ?? []);
      const m = await adminAPI.getMasjids();
      setMasjids(m?.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // build payload exactly as controllers expect
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        city: form.city,
        area: form.area,
        masjidId: form.masjidId,
        role: form.role,
      };

      const res = await adminAPI.createUser(payload);
      if (res?.success) {
        notify.success("User created");
        onCreated?.();
        onClose?.();
      } else {
        notify.error(res?.message || "Create failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  // helper convert lists to select options
  const cityOptions = cities.map((c) => ({ value: c._id, label: c.name }));
  const areaOptions = (areas || [])
    .filter((a) => a.city?._id === form.city)
    .map((a) => ({ value: a._id, label: a.name }));
  const masjidOptions = (masjids || [])
    .filter((m) => {
      if (!form.city && !form.area) return true;
      if (form.area)
        return m.area?._id === form.area || form.masjidId.includes(m._id);
      if (form.city)
        return m.city?._id === form.city || form.masjidId.includes(m._id);
      return true;
    })
    .map((m) => ({ value: m._id, label: m.name }));

  return (
    <Modal open={open} onClose={onClose} title="Create user" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full h-10 rounded-md border px-3 bg-slate-100/40"
            >
              <option value="public">Public</option>
              <option value="masjid_admin">Masjid Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City
            </label>
            <select
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full h-10 rounded-md border px-3 bg-slate-100/40"
            >
              <option value="">Select city</option>
              {cityOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Area
            </label>
            <select
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              className="w-full h-10 rounded-md border px-3 bg-slate-100/40"
            >
              <option value="">Select area</option>
              {areaOptions.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          {form.role === "masjid_admin" && (
            <>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Masjids
              </label>
              <MultiSelect
                options={masjidOptions}
                value={form.masjidId}
                onChange={(vals) => update("masjidId", vals)}
                placeholder="Search & add masjids"
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white"
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
