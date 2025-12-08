// src/components/masjid/ContactInfo.js
"use client";
import React from "react";

export default function ContactInfo({ contacts }) {
  if (!contacts?.length) return null;

  return (
    <div className="bg-white/95 rounded-xl shadow-xl border border-white/40 backdrop-blur p-6">
      <h2 className="text-xl font-semibold mb-2">Contacts</h2>
      <ul className="space-y-2">
        {contacts.map((c, idx) => (
          <li key={idx} className="border-b border-gray-200 pb-2">
            <p className="font-semibold">
              {c.role.charAt(0).toUpperCase() + c.role.slice(1)}: {c.name}
            </p>
            {c.phone && <p className="text-gray-600 text-sm">📞 {c.phone}</p>}
            {c.email && <p className="text-gray-600 text-sm">✉️ {c.email}</p>}
            {c.note && <p className="text-gray-500 italic text-sm">{c.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
