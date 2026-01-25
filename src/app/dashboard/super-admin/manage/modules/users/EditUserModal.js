// src/app/dashboard/super-admin/manage/modules/users/EditUserModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import MultiSelect from "@/components/form/MultiSelect";
import PasswordInput from "@/components/form/PasswordInput";
import { notify } from "@/lib/toast";

export default function EditUserModal({ open, onClose, userId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [masjids, setMasjids] = useState([]);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "public",
    city: "",
    area: "",
    masjidId: [],
    newPassword: "",
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!open) return;

    Promise.all([
      fetch(`/api/super-admin/users/${userId}`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`/api/super-admin/cities?limit=1000`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`/api/super-admin/areas?limit=5000`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`/api/super-admin/masjids?limit=5000`, {
        credentials: "include",
      }).then((r) => r.json()),
    ]).then(([u, c, a, m]) => {
      const user = u.data;

      setCities(c.data || []);
      setAreas(a.data || []);
      setMasjids(m.data || []);

      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "public",
        city: user.city?._id || "",
        area: user.area?._id || "",
        masjidId: Array.isArray(user.masjidId)
          ? user.masjidId.map((x) => x._id)
          : [],
        newPassword: "",
      });
    });
  }, [open, userId]);

  const filteredAreas = areas.filter((a) => a.city?._id === form.city);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        city: form.city,
        area: form.area,
        masjidId: form.masjidId,
      };

      if (showResetPassword && form.newPassword.trim()) {
        payload.password = form.newPassword.trim();
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
        onUpdated?.();
        onClose();
      } else {
        notify.error(json.message || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit User" size="lg">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

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
            <option value="">City</option>
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
            <option value="">Area</option>
            {filteredAreas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {form.role === "masjid_admin" && (
          <MultiSelect
            options={masjids.map((m) => ({
              value: m._id,
              label: `${m.name} (${m.area?.name})`,
            }))}
            value={form.masjidId}
            onChange={(v) => update("masjidId", v)}
            placeholder="Assigned Masjids"
          />
        )}

        <div className="border-t pt-3">
          <button
            type="button"
            className="text-sm text-blue-600 underline"
            onClick={() => setShowResetPassword((s) => !s)}
          >
            {showResetPassword ? "Cancel Password Reset" : "Reset Password"}
          </button>

          {showResetPassword && (
            <PasswordInput
              label="New Password"
              value={form.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-slate-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
