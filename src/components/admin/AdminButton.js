// src/components/admin/AdminButton.js

"use client";

export default function AdminButton({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-slate-700 hover:bg-slate-800 text-white",
    outline: "border border-slate-600 text-slate-700 hover:bg-slate-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

