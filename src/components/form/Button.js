// src/components/form/Button.js

"use client";

export function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 ${className}`}
    >
      {children}
    </button>
  );
}
