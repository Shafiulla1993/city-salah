// src/app/dashboard/super-admin/manage/modules/masjids/MasjidForm.js

"use client";

import { Input } from "@/components/form/Input";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerRulesForm from "./PrayerRulesForm";
import MasjidLocationPicker from "./MasjidLocationPicker";

export default function MasjidForm({
  form,
  setForm,
  prayerRules,
  setPrayerRules,
  cities = [],
  areas = [],
  image,
  onImageSelect,
  mapOpen,
  setMapOpen,
}) {
  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const filteredAreas = areas.filter(
    (a) => !form.city || a.city?._id === form.city
  );

  return (
    <div className="space-y-6">
      {/* NAME */}
      <Input
        label="Masjid Name *"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />

      {/* ADDRESS */}
      <Input
        label="Address"
        value={form.address}
        onChange={(e) => update("address", e.target.value)}
      />

      {/* IMAGE */}
      <div>
        <label className="block mb-1 font-medium">Masjid Image</label>

        {image.url && (
          <img
            src={image.url}
            className="mb-2 w-full max-h-40 object-cover rounded"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageSelect(e.target.files?.[0])}
        />
      </div>

      {/* CITY / AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="border px-3 py-2 rounded"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={form.area}
          onChange={(e) => update("area", e.target.value)}
        >
          <option value="">Select Area</option>
          {filteredAreas.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* LADIES */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.ladiesPrayerFacility}
          onChange={(e) => update("ladiesPrayerFacility", e.target.checked)}
        />
        Ladies prayer facility available
      </label>

      {/* LAT / LNG */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Latitude *"
          value={form.lat}
          onChange={(e) => update("lat", e.target.value)}
        />
        <Input
          label="Longitude *"
          value={form.lng}
          onChange={(e) => update("lng", e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={() => setMapOpen(true)}
        className="bg-blue-600 text-white py-2 rounded w-full"
      >
        Pick Location on Map
      </button>

      {/* CONTACTS */}
      <ContactPersonsForm
        contacts={form.contacts}
        onChange={(v) => update("contacts", v)}
      />

      {/* PRAYER RULES */}
      <PrayerRulesForm value={prayerRules} onChange={setPrayerRules} />

      {/* MAP */}
      <MasjidLocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        lat={form.lat}
        lng={form.lng}
        onSelect={(lat, lng) => {
          update("lat", lat);
          update("lng", lng);
        }}
      />
    </div>
  );
}
