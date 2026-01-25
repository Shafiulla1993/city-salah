// src/app/dashboard/super-admin/manage/modules/thoughts/DeleteThoughtModal.js
"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function DeleteThoughtModal({
  open,
  onClose,
  thoughtId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!thoughtId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/super-admin/thoughts/${thoughtId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data?.success) {
        notify.success("Thought deleted");
        onDeleted?.();
        onClose();
      } else {
        notify.error(data?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Thought" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this thought?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
