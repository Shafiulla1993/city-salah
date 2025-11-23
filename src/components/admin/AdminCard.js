// src/components/admin/AdminCard.js
"use client";

export default function AdminCard({ title, actions, children }) {
  return (
    <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl shadow-md p-6">
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}


