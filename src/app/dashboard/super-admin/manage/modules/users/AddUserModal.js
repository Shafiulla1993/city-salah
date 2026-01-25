// src/app/dashboard/super-admin/manage/modules/users/AddUserModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import MultiSelect from "@/components/form/MultiSelect";
import PasswordInput from "@/components/form/PasswordInput";
import { notify } from "@/lib/toast";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "public",
  phone: "",
  city: "",
  area: "",
  masjidId: [],
};

export default function AddUserModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);

  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);

  // User location
  const [form, setForm] = useState(emptyForm);

  // Masjid filter (UI only)
  const [filterCity, setFilterCity] = useState("");
  const [filterArea, setFilterArea] = useState("");

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  /* -------- RESET ON OPEN -------- */
  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setFilterCity("");
      setFilterArea("");
    }
  }, [open]);

  /* -------- LOAD MASTER DATA -------- */
  useEffect(() => {
    if (!open) return;

    Promise.all([
      fetch("/api/super-admin/cities?limit=1000", {
        credentials: "include",
      }).then((r) => r.json()),
      fetch("/api/super-admin/areas?limit=5000", {
        credentials: "include",
      }).then((r) => r.json()),
      fetch("/api/super-admin/masjids?limit=5000", {
        credentials: "include",
      }).then((r) => r.json()),
    ]).then(([c, a, m]) => {
      setCities(c.data || []);
      setAreas(a.data || []);
      setMasjids(m.data || []);
    });
  }, [open]);

  /* -------- USER AREA FILTER -------- */
  const userAreas = areas.filter((a) => a.city?._id === form.city);

  /* -------- MASJID FILTER -------- */
  const filterAreas = areas.filter((a) => a.city?._id === filterCity);

  const filteredMasjids = masjids.filter((m) => {
    if (!filterCity) return false;
    if (filterCity && !filterArea)
      return String(m.city?._id) === String(filterCity);
    return (
      String(m.city?._id) === String(filterCity) &&
      String(m.area?._id) === String(filterArea)
    );
  });

  /* -------- SUBMIT -------- */
  async function submit(e) {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.city ||
      !form.area
    ) {
      return notify.error("Fill all required fields");
    }

    if (form.role === "masjid_admin" && !form.masjidId.length) {
      return notify.error("Assign at least one masjid to Masjid Admin");
    }

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
      } else {
        notify.error(json.message || "Create failed");
      }
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
            value={form.name || ""}
            onChange={(e) => update("name", e.target.value)}
          />

          <Input
            label="Email"
            value={form.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />

          <Input
            label="Phone"
            value={form.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
          />

          <PasswordInput
            label="Password"
            value={form.password || ""}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>

        {/* USER LOCATION */}
        <div className="grid grid-cols-3 gap-3">
          <select
            className="border px-3 py-2 rounded"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="public">Public</option>
            <option value="masjid_admin">Masjid Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            className="border px-3 py-2 rounded"
            value={form.city}
            onChange={(e) => {
              update("city", e.target.value);
              update("area", "");
            }}
          >
            <option value="">User City</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded"
            value={form.area}
            disabled={!form.city}
            onChange={(e) => update("area", e.target.value)}
          >
            <option value="">User Area</option>
            {userAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* MASJID ASSIGNMENT (ONLY FOR MASJID ADMIN) */}
        {form.role === "masjid_admin" && (
          <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
            <p className="font-semibold text-slate-700">Assign Masjids</p>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="border px-3 py-2 rounded"
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setFilterArea("");
                  update("masjidId", []);
                }}
              >
                <option value="">Filter City</option>
                {cities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="border px-3 py-2 rounded"
                value={filterArea}
                disabled={!filterCity}
                onChange={(e) => {
                  setFilterArea(e.target.value);
                  update("masjidId", []);
                }}
              >
                <option value="">Filter Area</option>
                {filterAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <MultiSelect
              options={filteredMasjids.map((m) => ({
                value: m._id,
                label: `${m.name} (${m.area?.name})`,
              }))}
              value={form.masjidId}
              onChange={(v) => update("masjidId", v)}
              placeholder="Select masjids"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-slate-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Create User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
