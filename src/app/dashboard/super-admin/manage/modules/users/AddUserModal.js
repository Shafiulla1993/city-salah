// src/app/dashboard/super-admin/manage/modules/users/AddUserModal.js
"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
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

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  /** Load cities + masjids */
  useEffect(() => {
    if (!open) return;
    loadLists();
  }, [open]);

  async function loadLists() {
    try {
      const [c, m] = await Promise.all([
        adminAPI.getCities(),
        adminAPI.getMasjids(),
      ]);
      setCities(c?.data ?? []);
      setMasjids(m?.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  /** Load areas when city changes */
  useEffect(() => {
    if (!form.city) {
      setAreas([]);
      update("area", "");
      return;
    }

    adminAPI
      .getAreas(`?city=${form.city}`)
      .then((res) => setAreas(res?.data ?? []))
      .catch(() => setAreas([]));
  }, [form.city]);

  /** Submit */
  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !form.name ||
        !form.phone ||
        !form.password ||
        !form.city ||
        !form.area
      ) {
        notify.error("Name, phone, password, city and area are required");
        setLoading(false);
        return;
      }

      if (form.role === "masjid_admin" && form.masjidId.length === 0) {
        notify.error("Masjid admin must be assigned to at least one masjid");
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        city: form.city,
        area: form.area,
        role: form.role,
        masjidId: form.masjidId,
      };

      const res = await adminAPI.createUser(payload);
      if (res?.success) {
        notify.success("User created");
        onCreated?.();
        onClose?.();
      } else notify.error(res?.message || "Create failed");
    } catch (err) {
      console.error(err);
      notify.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  /** Options */
  const cityList = cities.map((c) => ({ value: c._id, label: c.name }));
  const areaList = areas.map((a) => ({ value: a._id, label: a.name }));

  const masjidList = masjids
    .filter((m) => {
      if (!form.city && !form.area) return true;
      if (form.area) return m.area?._id === form.area;
      if (form.city) return m.city?._id === form.city;
      return true;
    })
    .map((m) => ({ value: m._id, label: m.name }));

  return (
    <Modal open={open} onClose={onClose} title="Create User" size="lg">
      <form onSubmit={submit} className="space-y-5">
        {/* MAIN FIELDS */}
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

        {/* ROLE / CITY / AREA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Role</label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="border px-3 py-2 rounded-lg w-full"
            >
              <option value="public">Public</option>
              <option value="masjid_admin">Masjid Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">City</label>
            <select
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="border px-3 py-2 rounded-lg w-full"
            >
              <option value="">Select City</option>
              {cityList.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Area</label>
            <select
              value={form.area}
              disabled={!form.city}
              onChange={(e) => update("area", e.target.value)}
              className="border px-3 py-2 rounded-lg w-full disabled:bg-gray-200"
            >
              <option value="">Select Area</option>
              {areaList.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MASJID ADMIN SELECTION */}
        {form.role === "masjid_admin" && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Assign Masjids
            </label>
            <MultiSelect
              options={masjidList}
              value={form.masjidId}
              onChange={(vals) => update("masjidId", vals)}
            />
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border"
            onClick={onClose}
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
