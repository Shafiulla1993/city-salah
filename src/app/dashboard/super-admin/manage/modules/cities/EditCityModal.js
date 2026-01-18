// src/app/dashboard/super-admin/manage/modules/cities/modals/EditCityModal.js
"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { notify } from "@/lib/toast";

export default function EditCityModal({ open, onClose, cityId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ name: "", timezone: "Asia/Kolkata" });

  useEffect(() => {
    if (!open || !cityId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cityId]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/cities/${cityId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return notify.error(data?.message || "Failed to load city");
      }

      const c = data.data;
      setInitial(c);
      setForm({ name: c.name || "", timezone: c.timezone || "Asia/Kolkata" });
    } catch (err) {
      console.error(err);
      notify.error("Failed to load city");
    } finally {
      setLoading(false);
    }
  }

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!initial) return;

    const payload = {};
    if (form.name !== initial.name) payload.name = form.name;
    if (form.timezone !== initial.timezone) payload.timezone = form.timezone;

    if (Object.keys(payload).length === 0) {
      notify.info("No changes made");
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/cities/${cityId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        return notify.error(data?.message || "Update failed");
      }

      notify.success("City updated");
      onUpdated?.(data.data);
      onClose();
    } catch (err) {
      console.error(err);
      notify.error("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit City" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <Input
          label="Timezone"
          value={form.timezone}
          onChange={(e) => update("timezone", e.target.value)}
        />

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
            className="px-4 py-2 rounded-lg bg-slate-700 text-white"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
