// src/app/dashboard/super-admin/manage/modules/cities/modals/DeleteCityModal.js
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { notify } from "@/lib/toast";

export default function DeleteCityModal({ open, onClose, cityId, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [check, setCheck] = useState(null);

  useEffect(() => {
    if (!open || !cityId) return;

    setCheck(null);
    checkCity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cityId]);

  async function checkCity() {
    setChecking(true);
    try {
      const res = await fetch(`/api/super-admin/cities/${cityId}/can-delete`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return notify.error(data?.message || "Failed to check city");
      }

      setCheck(data);
    } catch (err) {
      console.error(err);
      notify.error("Failed to check city status");
      setCheck(null);
    } finally {
      setChecking(false);
    }
  }

  async function handleDelete() {
    if (!cityId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/cities/${cityId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        return notify.error(data?.message || "Delete failed");
      }

      notify.success("City deleted");
      onDeleted?.(cityId);
      onClose();
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete city");
    } finally {
      setLoading(false);
    }
  }

  const blocked = check && !check.canDelete;

  return (
    <Modal open={open} onClose={onClose} title="Delete City" size="sm">
      {checking || !check ? (
        <div className="py-10 text-center text-gray-500">Checking…</div>
      ) : blocked ? (
        <div className="space-y-4">
          <p className="text-red-600 font-medium">
            This city cannot be deleted.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            {check.linkedAreas > 0 && (
              <p>• {check.linkedAreas} area(s) are linked</p>
            )}
            {check.linkedMasjids > 0 && (
              <p>• {check.linkedMasjids} masjid(s) are linked</p>
            )}
            {check.linkedUsers > 0 && (
              <p>• {check.linkedUsers} user(s) are linked</p>
            )}
          </div>

          <p className="text-gray-600 text-sm">
            Please delete or reassign linked items before deleting this city.
          </p>

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
          <p className="text-gray-700">
            Are you sure you want to delete this city?
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
      )}
    </Modal>
  );
}
