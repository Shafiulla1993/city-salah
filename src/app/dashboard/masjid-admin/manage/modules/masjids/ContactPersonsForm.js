// src/app/dashboard/masjid-admin/manage/modules/masjids/ContactPersonsForm.js

"use client";

import { Input } from "@/components/form/Input";

export default function ContactPersonsForm({ contacts, onChange }) {
  function update(role, field, value) {
    onChange({
      ...contacts,
      [role]: { ...contacts[role], [field]: value },
    });
  }

  function PersonBlock(role, title) {
    const person = contacts?.[role] || {};

    return (
      <div className="border rounded-lg p-4 space-y-3 bg-white/40">
        <p className="font-semibold text-lg">{title}</p>

        <Input
          label="Name"
          value={person.name || ""}
          onChange={(e) => update(role, "name", e.target.value)}
        />

        <Input
          label="Phone"
          value={person.phone || ""}
          onChange={(e) => update(role, "phone", e.target.value)}
        />

        <Input
          label="Email"
          value={person.email || ""}
          onChange={(e) => update(role, "email", e.target.value)}
        />

        <Input
          label="Note"
          value={person.note || ""}
          onChange={(e) => update(role, "note", e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PersonBlock("imam", "Imam")}
      {PersonBlock("mozin", "Mozin")}
      {PersonBlock("mutawalli", "Mutawalli")}
    </div>
  );
}
