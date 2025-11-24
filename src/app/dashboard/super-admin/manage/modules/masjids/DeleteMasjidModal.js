"use client";

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function DeleteMasjidModal({
  open,
  onClose,
  masjidId,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [check, setCheck] = useState(null);

  useEffect(() => {
    if (!open || !masjidId) return;
    // optional: you may implement a can-delete endpoint for masjid if needed
    setCheck(null);
  }, [open, masjidId]);

  async function handleDelete() {
    if (!masjidId) return;
    setLoading(true);
    try {
      const res = await adminAPI.deleteMasjid(masjidId);
      if (res?.success) {
        notify.success("Masjid deleted");
        onDeleted?.(masjidId);
        onClose();
      } else {
        notify.error(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete masjid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Masjid" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this masjid?
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
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
