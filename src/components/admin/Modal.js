// src/components/admin/Modal.js

"use client";

import React from "react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;

  const sizeClasses =
    size === "sm"
      ? "max-w-lg"
      : size === "lg"
      ? "max-w-4xl"
      : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose?.()}
        aria-hidden
      />
      <div className={`relative w-full ${sizeClasses} mx-4`}>
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/30 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <button
              onClick={() => onClose?.()}
              className="text-slate-600 hover:text-slate-800"
            >
              ✕
            </button>
          </div>
          <div className="p-5 max-h-[70vh] overflow-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
