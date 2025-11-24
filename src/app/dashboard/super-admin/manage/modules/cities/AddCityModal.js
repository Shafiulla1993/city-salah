// File: src/app/dashboard/super-admin/manage/modules/cities/modals/AddCityModal.js
"use client";

import React, { useState } from "react";
import Modal from "@/components/admin/Modal";
import { Input } from "@/components/form/Input";
import { notify } from "@/lib/toast";
import { adminAPI } from "@/lib/api/sAdmin";

export default function AddCityModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", timezone: "Asia/Kolkata" });

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.name.trim())
      return notify.error("Name is required");

    setLoading(true);
    try {
      const res = await adminAPI.createCity(form);
      if (res?.success) {
        notify.success("City created");
        onCreated?.(res.data);
        onClose();
        setForm({ name: "", timezone: "Asia/Kolkata" });
      } else {
        notify.error(res?.message || "Create failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add City" size="sm">
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
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
