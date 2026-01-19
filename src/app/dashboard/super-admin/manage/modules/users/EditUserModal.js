// src/app/dashboard/super-admin/manage/modules/users/EditUserModal.js
// src/app/dashboard/super-admin/manage/modules/users/EditUserModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import MultiSelect from "@/components/form/MultiSelect";
import { notify } from "@/lib/toast";

export default function EditUserModal({ open, onClose, userId, onUpdated }) {
  const [form, setForm] = useState({
    name: "",
    phone: "", // used only when admin chooses to change
    email: "",
    password: "",
    role: "public",
    city: "",
    area: "",
    masjidId: [],
  });

  const [masjids, setMasjids] = useState([]);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    if (!open) return;

    Promise.all([
      fetch(`/api/super-admin/users/${userId}`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`/api/super-admin/masjids`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
    ]).then(([u, m]) => {
      const user = u.data;
      setInitial(user);

      setForm({
        name: user.name || "",
        phone: "",
        email: user.email || "",
        password: "",
        role: user.role || "public",
        city: user.city?._id || "",
        area: user.area?._id || "",
        masjidId: Array.isArray(user.masjidId)
          ? user.masjidId.map((x) => (typeof x === "object" ? x._id : x))
          : [],
      });

      setMasjids(m.data || []);
    });
  }, [open, userId]);

  if (!initial) return null;

  async function submit(e) {
    e.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      city: form.city || null,
      area: form.area || null,
      masjidId: form.masjidId,
    };

    // Only update phone if admin explicitly entered new one
    if (showPhoneEdit && form.phone.trim()) {
      payload.phone = form.phone.trim();
    }

    const res = await fetch(`/api/super-admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      notify.success("User updated");
      onUpdated(json.data);
      onClose();
    } else {
      notify.error(json.message || "Update failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit User" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* PHONE (SECURE) */}
        {!showPhoneEdit ? (
          <button
            type="button"
            onClick={() => setShowPhoneEdit(true)}
            className="text-sm text-blue-600 underline"
          >
            Change Phone Number
          </button>
        ) : (
          <Input
            label="New Phone Number"
            placeholder="Enter new phone (leave empty to keep old)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        )}

        {/* ROLE */}
        <div>
          <label className="block mb-1 text-sm font-medium">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border px-3 py-2 rounded-lg w-full"
          >
            <option value="public">Public</option>
            <option value="masjid_admin">Masjid Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        {/* MASJID ASSIGNMENT */}
        {form.role === "masjid_admin" && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Assigned Masjids
            </label>
            <MultiSelect
              options={masjids.map((m) => ({ value: m._id, label: m.name }))}
              value={form.masjidId}
              onChange={(vals) => setForm({ ...form, masjidId: vals })}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-slate-700 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
