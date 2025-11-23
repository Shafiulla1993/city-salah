// src/components/admin/DeleteConfirm.js

"use client";

export default function DeleteConfirm({ open, onClose, onConfirm, title = "Confirm delete", message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/30 overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-700 mb-4">{message || "This action cannot be undone."}</p>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg text-sm border" onClick={onClose}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white" onClick={onConfirm}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
