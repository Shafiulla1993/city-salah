// src/app/dashboard/super-admin/manage/modules/thoughts/AddThoughtModal.js
"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function AddThoughtModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    text: "",
    startDate: "",
    endDate: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.text.trim()) return notify.error("Text is required");
    if (!form.startDate || !form.endDate)
      return notify.error("Date range required");

    const fd = new FormData();
    fd.append("text", form.text);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    for (const file of form.images) fd.append("file", file);

    setLoading(true);
    try {
      const res = await adminAPI.createThought(fd);
      if (res?.success) {
        notify.success("Thought created");
        onCreated?.();
        onClose();
        setForm({ text: "", startDate: "", endDate: "", images: [] });
      } else notify.error(res?.message || "Create failed");
    } catch {
      notify.error("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Thought" size="lg">
      <form onSubmit={submit} className="space-y-5">
        <textarea
          value={form.text}
          onChange={(e) => update("text", e.target.value)}
          rows={4}
          className="w-full border rounded p-3"
          placeholder="Enter thought text"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">From</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">To</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => update("images", Array.from(e.target.files || []))}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
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
