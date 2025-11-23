// src/components/admin/AdminTabs.js

"use client";

export default function AdminTabs({ tabs, active, onChange }) {
  return (
    <div className="tabs tabs-boxed bg-white/70 backdrop-blur rounded-xl p-2 shadow border border-white/40 mb-4">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`tab px-4 py-2 rounded-lg font-medium ${
            active === t.key
              ? "tab-active bg-slate-700 text-white shadow"
              : "text-slate-700 hover:bg-slate-200"
          }`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

