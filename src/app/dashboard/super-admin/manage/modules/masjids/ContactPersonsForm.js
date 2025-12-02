// src/app/dashboard/super-admin/manage/modules/masjids/components/ContactPersonsForm.js

"use client";
import { Input } from "@/components/form/Input";

export default function ContactPersonsForm({ contacts, onChange }) {
  function update(role, field, value) {
    onChange({
      ...contacts,
      [role]: { ...contacts[role], [field]: value },
    });
  }

  function renderBlock(role, title, required = false) {
    const data = contacts?.[role] || {};
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-white/40">
        <p className="font-semibold text-lg">
          {title} {required && <span className="text-red-600">*</span>}
        </p>
        <Input
          label={`Name ${required ? "" : ""}`}
          value={data.name || ""}
          onChange={(e) => update(role, "name", e.target.value)}
        />
        <Input
          label="Phone"
          value={data.phone || ""}
          onChange={(e) => update(role, "phone", e.target.value)}
        />
        <Input
          label="Email"
          value={data.email || ""}
          onChange={(e) => update(role, "email", e.target.value)}
        />
        <Input
          label="Note"
          value={data.note || ""}
          onChange={(e) => update(role, "note", e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderBlock("imam", "Imam", true)}
      {renderBlock("mozin", "Mozin")}
      {renderBlock("mutawalli", "Mutawalli")}
    </div>
  );
}
