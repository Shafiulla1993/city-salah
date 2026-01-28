// src/app/dashboard/super-admin/manage/modules/masjids/MasjidForm.js

"use client";

import { useState } from "react";
import { Input } from "@/components/form/Input";
import ContactPersonsForm from "./ContactPersonsForm";
import PrayerRulesForm from "./PrayerRulesForm";
import MasjidLocationPicker from "./MasjidLocationPicker";
import { notify } from "@/lib/toast";
import AddAreaModal from "../areas/AddAreaModal";
import AddCityModal from "../cities/AddCityModal";

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
  onCityAdded,
  onAreaAdded,
}) {
  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const [addingCity, setAddingCity] = useState(false);
  const [addingArea, setAddingArea] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newArea, setNewArea] = useState("");
  const [openCityModal, setOpenCityModal] = useState(false);
  const [openAreaModal, setOpenAreaModal] = useState(false);

  const filteredAreas = areas.filter(
    (a) => !form.city || a.city?._id === form.city,
  );

  async function createCity() {
    if (!newCity.trim()) return;

    const res = await fetch("/api/super-admin/cities", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ name: newCity }),
    });
    const json = await res.json();

    if (json.success) {
      notify.success("City added");
      onCityAdded?.(json.data._id);
      setNewCity("");
      setAddingCity(false);
    } else {
      notify.error(json.message || "City create failed");
    }
  }

  async function createArea() {
    if (!newArea.trim() || !form.city) return;

    const res = await fetch("/api/super-admin/areas", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ name: newArea, city: form.city }),
    });
    const json = await res.json();

    if (json.success) {
      notify.success("Area added");
      onAreaAdded?.(form.city, json.data._id);
      setNewArea("");
      setAddingArea(false);
    } else {
      notify.error(json.message || "Area create failed");
    }
  }

  return (
    <div className="space-y-6">
      <Input
        label="Masjid Name *"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />

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

      {/* CITY */}
      <div>
        <label className="block mb-1 font-medium">City *</label>
        {!addingCity ? (
          <div className="flex gap-2">
            <select
              className="flex-1 border px-3 py-2 rounded"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setOpenCityModal(true)}
              className="px-2 py-1 rounded bg-emerald-600 text-white text-sm"
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="border px-3 py-2 rounded w-full"
              placeholder="New city name"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
            <button
              type="button"
              className="bg-slate-700 text-white px-3 rounded"
              onClick={createCity}
            >
              Add
            </button>
            <button
              type="button"
              className="px-3"
              onClick={() => setAddingCity(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* AREA */}
      <div>
        <label className="block mb-1 font-medium">Area *</label>
        {!addingArea ? (
          <div className="flex items-center gap-2">
            <select
              className="flex-1 border px-3 py-2 rounded"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            >
              <option value="">Select Area</option>
              {areas
                .filter((a) => a.city?._id === form.city)
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={() => setOpenAreaModal(true)}
              className="px-2 py-1 rounded bg-emerald-600 text-white text-sm"
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="border px-3 py-2 rounded w-full"
              placeholder="New area name"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
            />
            <button
              type="button"
              className="bg-slate-700 text-white px-3 rounded"
              onClick={createArea}
            >
              Add
            </button>
            <button
              type="button"
              className="px-3"
              onClick={() => setAddingArea(false)}
            >
              Cancel
            </button>
          </div>
        )}
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

      <ContactPersonsForm
        contacts={form.contacts}
        onChange={(v) => update("contacts", v)}
      />

      <PrayerRulesForm value={prayerRules} onChange={setPrayerRules} />

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
      <AddCityModal
        open={openCityModal}
        onClose={() => setOpenCityModal(false)}
        onCreated={(city) => {
          onCityAdded(city._id); // refreshCities
          setForm((f) => ({ ...f, city: city._id }));
          setOpenCityModal(false);
        }}
      />

      <AddAreaModal
        open={openAreaModal}
        onClose={() => setOpenAreaModal(false)}
        onCreated={(area) => {
          onAreaAdded(area.city._id, area._id); // refreshAreas
          setForm((f) => ({ ...f, area: area._id }));
          setOpenAreaModal(false);
        }}
      />
    </div>
  );
}
