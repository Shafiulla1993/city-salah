// src/components/Dashboard/DeleteModal.js
"use client";

import React, { useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";

const deleteFns = {
  cities: adminAPI.deleteCity,
  areas: adminAPI.deleteArea,
  masjids: adminAPI.deleteMasjid,
  users: adminAPI.deleteUser,
};

export default function DeleteModal({ item, type, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!item || !item._id) return;
    const fn = deleteFns[type];
    if (typeof fn !== "function") {
      alert("Delete API not configured for " + type);
      return;
    }

    try {
      setLoading(true);
      await fn(item._id);
      alert("Deleted successfully");
      onDeleted && onDeleted(item);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Delete Confirmation</h3>
        <p className="mb-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{item?.name ?? item?._id}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
