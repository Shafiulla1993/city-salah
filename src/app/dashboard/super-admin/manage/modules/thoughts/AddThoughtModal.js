// src/app/dashboard/super-admin/manage/modules/thoughts/AddThoughtModal.js
// src/app/dashboard/super-admin/manage/modules/thoughts/AddThoughtModal.js
"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function AddThoughtModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    text: "",
    startDate: "",
    endDate: "",
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function uploadImages() {
    const uploadedUrls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/uploads/thought-image", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json();
      if (!data?.success) throw new Error("Image upload failed");

      uploadedUrls.push(data.url);
    }

    return uploadedUrls;
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.text.trim()) return notify.error("Text is required");
    if (!form.startDate || !form.endDate)
      return notify.error("Date range is required");

    setLoading(true);
    try {
      let imageUrls = [];
      if (files.length) {
        imageUrls = await uploadImages();
      }

      const res = await fetch("/api/super-admin/thoughts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images: imageUrls,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        notify.success("Thought created");
        onCreated?.();
        onClose();

        setForm({ text: "", startDate: "", endDate: "" });
        setFiles([]);
        setPreviews([]);
      } else {
        notify.error(data?.message || "Create failed");
      }
    } catch (err) {
      notify.error("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Thought" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <textarea
          value={form.text}
          onChange={(e) => update("text", e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Enter thought text"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </div>

        {/* Image Upload */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const f = Array.from(e.target.files || []);
            setFiles(f);
            setPreviews(f.map((x) => URL.createObjectURL(x)));
          }}
          className="text-sm"
        />

        {/* Preview */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                className="w-24 h-24 object-cover rounded-lg border"
                alt="preview"
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
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
