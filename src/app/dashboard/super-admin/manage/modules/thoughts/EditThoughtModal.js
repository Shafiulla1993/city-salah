// src/app/dashboard/super-admin/manage/modules/thoughts/EditThoughtModal.js
"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function EditThoughtModal({
  open,
  onClose,
  thoughtId,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    text: "",
    startDate: "",
    endDate: "",
    images: [],
  });

  useEffect(() => {
    if (open && thoughtId) load();
  }, [open, thoughtId]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminAPI.getThoughtById(thoughtId);
      const t = res?.data;
      if (t) {
        setInitial(t);
        setForm({
          text: t.text,
          startDate: t.startDate?.substring(0, 10),
          endDate: t.endDate?.substring(0, 10),
          images: [],
        });
      }
    } catch {
      notify.error("Failed to load");
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

    const fd = new FormData();
    if (form.text !== initial.text) fd.append("text", form.text);
    if (form.startDate !== initial.startDate.substring(0, 10))
      fd.append("startDate", form.startDate);
    if (form.endDate !== initial.endDate.substring(0, 10))
      fd.append("endDate", form.endDate);
    for (const f of form.images) fd.append("file", f);

    setLoading(true);
    try {
      const res = await adminAPI.updateThought(thoughtId, fd);
      if (res?.success) {
        notify.success("Thought updated");
        onUpdated?.();
        onClose();
      } else notify.error(res?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Thought" size="lg">
      {loading && !initial ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <textarea
            value={form.text}
            onChange={(e) => update("text", e.target.value)}
            rows={4}
            className="w-full border rounded p-3"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                From
              </label>
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
      )}
    </Modal>
  );
}
