// File: src/app/dashboard/super-admin/manage/modules/cities/modals/EditCityModal.js
"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function EditCityModal({ open, onClose, cityId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ name: "", timezone: "Asia/Kolkata" });

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, cityId]);

  async function load() {
    if (!cityId) return;
    setLoading(true);
    try {
      const res = await adminAPI.getCityById(cityId);
      const c = res?.data;
      if (c) {
        setInitial(c);
        setForm({ name: c.name || "", timezone: c.timezone || "Asia/Kolkata" });
      }
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
    setLoading(true);
    try {
      const payload = {};
      if (form.name !== initial.name) payload.name = form.name;
      if (form.timezone !== initial.timezone) payload.timezone = form.timezone;

      if (Object.keys(payload).length === 0) {
        notify.info("No changes made");
        onClose();
        setLoading(false);
        return;
      }

      const res = await adminAPI.updateCity(cityId, payload);
      if (res?.success) {
        notify.success("City updated");
        onUpdated?.(res.data);
        onClose();
      } else {
        notify.error(res?.message || "Update failed");
      }
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
