// src/app/dashboard/super-admin/manage/modules/thoughts/EditThoughtModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function EditThoughtModal({
  open,
  onClose,
  thoughtId,
  onUpdated,
}) {
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    text: "",
    startDate: "",
    endDate: "",
    images: [],
    status: "draft",
  });

  useEffect(() => {
    if (!open || !thoughtId) return;

    (async () => {
      const res = await fetch(`/api/super-admin/thoughts/${thoughtId}`, {
        credentials: "include",
      });
      const data = await res.json();
      const t = data?.data;
      if (!t) return;

      setInitial(t);
      setForm({
        text: t.text || "",
        startDate: t.startDate?.substring(0, 10) || "",
        endDate: t.endDate?.substring(0, 10) || "",
        images: t.images || [],
        status: t.status || "draft",
      });
    })();
  }, [open, thoughtId]);

  if (!open || !initial) return null;

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/uploads/thought-image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    const data = await res.json();
    return data.url;
  }

  async function submit(status) {
    const fd = new FormData();
    fd.append("text", form.text);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    fd.append("status", status);

    form.images.forEach((url) => fd.append("images", url));

    const res = await fetch(`/api/super-admin/thoughts/${thoughtId}`, {
      method: "PUT",
      credentials: "include",
      body: fd,
    });

    const data = await res.json();

    if (data?.success) {
      notify.success("Thought updated");
      onUpdated?.();
      onClose();
    } else {
      notify.error(data?.message || "Update failed");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Thought" size="lg">
      <div className="space-y-4">
        <textarea
          rows={4}
          className="w-full border rounded p-3"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            className="border rounded p-2"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="date"
            className="border rounded p-2"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>

        {/* Existing images */}
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((url) => (
              <div key={url} className="relative w-24 h-24 border rounded">
                <img src={url} className="w-full h-full object-cover rounded" />
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      images: s.images.filter((x) => x !== url),
                    }))
                  }
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload new images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            const urls = [];
            for (const f of files) urls.push(await uploadImage(f));
            setForm((s) => ({ ...s, images: [...s.images, ...urls] }));
          }}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => submit("draft")}
            className="px-4 py-2 border rounded"
          >
            Save Draft
          </button>
          <button
            onClick={() => submit("published")}
            className="px-4 py-2 bg-slate-700 text-white rounded"
          >
            Publish
          </button>
        </div>
      </div>
    </Modal>
  );
}
