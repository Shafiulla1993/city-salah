// src/app/dashboard/super-admin/manage/tabs/TimingsTab.js

"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api/sAdmin";
import TimingsSkeleton from "../modules/timings/TimingsSkeleton";
import TimingTemplatesTable from "../modules/timings/TimingTemplatesTable";
import TimingMappingsTable from "../modules/timings/TimingMappingsTable";
import AddTemplateModal from "../modules/timings/AddTemplateModal";
import EditTemplateModal from "../modules/timings/EditTemplateModal";
import DeleteTemplateModal from "../modules/timings/DeleteTemplateModal";
import AddMappingModal from "../modules/timings/AddMappingModal";
import DeleteMappingModal from "../modules/timings/DeleteMappingModal";
import AddManualTimingModal from "../modules/timings/AddManualTimingModal";
import GeneralTimingsList from "../modules/timings/GeneralTimingsList";

export default function TimingsTab() {
  const [activeInnerTab, setActiveInnerTab] = useState("templates");

  const [templates, setTemplates] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);

  const [addMappingOpen, setAddMappingOpen] = useState(false);
  const [deleteMappingId, setDeleteMappingId] = useState(null);

  const [addManualOpen, setAddManualOpen] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [tplRes, mapRes, cityRes, areaRes] = await Promise.all([
        adminAPI.getTimingTemplates(),
        adminAPI.getTimingMappings(),
        adminAPI.getCities(),
        adminAPI.getAreas("?limit=2000"),
      ]);

      setTemplates(tplRes?.data || []);
      setMappings(mapRes?.data || []);
      setCities(cityRes?.data || []);
      setAreas(areaRes?.data || []);
    } catch (err) {
      console.error("Failed to load timings data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredAreas = (cityId) =>
    areas.filter((a) => !cityId || a.city?._id === cityId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">General Prayer Timings</h2>
          <p className="text-sm text-gray-600">
            Manage shared city/area timing templates, mappings and manual
            day-wise timings
          </p>
        </div>

        <div className="flex gap-2">
          {activeInnerTab === "templates" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddTemplateOpen(true)}
            >
              + Create Template
            </button>
          )}

          {activeInnerTab === "mappings" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddMappingOpen(true)}
            >
              + Create Mapping
            </button>
          )}

          {activeInnerTab === "manual" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddManualOpen(true)}
            >
              + Add Day Timings
            </button>
          )}
        </div>
      </div>

      {/* Inner Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveInnerTab("templates")}
          className={`px-3 py-1 rounded-t-lg text-sm ${
            activeInnerTab === "templates"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Templates
        </button>

        <button
          onClick={() => setActiveInnerTab("mappings")}
          className={`px-3 py-1 rounded-t-lg text-sm ${
            activeInnerTab === "mappings"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Mappings
        </button>

        <button
          onClick={() => setActiveInnerTab("manual")}
          className={`px-3 py-1 rounded-t-lg text-sm ${
            activeInnerTab === "manual"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Manual Entry
        </button>
      </div>

      {/* Body */}
      <div className="bg-white rounded-xl shadow p-4 min-h-[200px]">
        {loading ? (
          <TimingsSkeleton />
        ) : activeInnerTab === "templates" ? (
          <TimingTemplatesTable
            templates={templates}
            onEdit={(id) => setEditTemplateId(id)}
            onDelete={(id) => setDeleteTemplateId(id)}
          />
        ) : activeInnerTab === "mappings" ? (
          <TimingMappingsTable
            mappings={mappings}
            cities={cities}
            areas={areas}
            filteredAreas={filteredAreas}
            onDelete={(id) => setDeleteMappingId(id)}
          />
        ) : (
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Use this section to set **exact timings** for a specific date,
              city and area (Sehri, Fajr start/end, Ishraq, Chasht, Zawaal, Asr
              Shafi/Hanafi, Maghrib, Isha, etc).
            </p>
            <p>
              Click <span className="font-semibold">“Add Day Timings”</span>{" "}
              above to create or override timings for a particular day.
            </p>
          </div>
        )}
      </div>

      {/* Template Modals */}
      <AddTemplateModal
        open={addTemplateOpen}
        onClose={() => setAddTemplateOpen(false)}
        onCreated={() => loadAll()}
      />

      <EditTemplateModal
        open={!!editTemplateId}
        templateId={editTemplateId}
        onClose={() => setEditTemplateId(null)}
        onUpdated={() => loadAll()}
      />

      <DeleteTemplateModal
        open={!!deleteTemplateId}
        templateId={deleteTemplateId}
        onClose={() => setDeleteTemplateId(null)}
        onDeleted={() => loadAll()}
      />

      {/* Mapping Modals */}
      <AddMappingModal
        open={addMappingOpen}
        onClose={() => setAddMappingOpen(false)}
        templates={templates}
        cities={cities}
        areas={areas}
        onCreated={() => loadAll()}
      />

      <DeleteMappingModal
        open={!!deleteMappingId}
        mappingId={deleteMappingId}
        onClose={() => setDeleteMappingId(null)}
        onDeleted={() => loadAll()}
      />

      {/* Manual Timing Modal */}
      <AddManualTimingModal
        open={addManualOpen}
        onClose={() => setAddManualOpen(false)}
        cities={cities}
        areas={areas}
        onSaved={() => {
          // In future we can show recent manual entries; for now just close.
          loadAll();
        }}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Saved General Timings</h2>
        <p className="text-xs text-gray-500">
          View all general prayer timings saved for a city/area for a given
          month.
        </p>
        <GeneralTimingsList cities={cities} areas={areas} />
      </section>
    </div>
  );
}
