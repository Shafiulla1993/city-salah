// src/app/dashboard/super-admin/manage/modules/areas/DeleteAreaModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function DeleteAreaModal({ open, onClose, areaId, onDeleted }) {
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !areaId) return;
    (async () => {
      const res = await fetch(`/api/super-admin/areas/${areaId}/can-delete`, {
        credentials: "include",
      });
      const data = await res.json();
      setCheck(data);
    })();
  }, [open, areaId]);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/super-admin/areas/${areaId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (data?.success) {
      notify.success("Area deleted");
      onDeleted?.(areaId);
      onClose();
    } else notify.error(data?.message || "Delete failed");
    setLoading(false);
  }

  const blocked = check && !check.canDelete;

  return (
    <Modal open={open} onClose={onClose} title="Delete Area" size="sm">
      {blocked ? (
        <div className="space-y-4">
          <p className="text-red-700 font-medium">
            This area cannot be deleted.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            {check.linkedMasjids > 0 && (
              <p>• {check.linkedMasjids} masjid(s) linked</p>
            )}
            {check.linkedUsers > 0 && (
              <p>• {check.linkedUsers} user(s) linked</p>
            )}
          </div>
          <div className="text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p>Are you sure you want to delete this area?</p>
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
      )}
    </Modal>
  );
}
