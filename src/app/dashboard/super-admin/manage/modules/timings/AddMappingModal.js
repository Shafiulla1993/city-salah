// src/app/dashboard/super-admin/manage/modules/timings/AddMappingModal.js

"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/admin/Modal";
import { adminAPI } from "@/lib/api/sAdmin";
import { notify } from "@/lib/toast";

export default function AddMappingModal({
  open,
  onClose,
  templates,
  cities,
  areas,
  onCreated,
}) {
  const [scope, setScope] = useState("city");
  const [cityId, setCityId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [globalOffset, setGlobalOffset] = useState("0");
  const [loading, setLoading] = useState(false);

  // in case cities/areas are not passed in (fallback)
  const [localCities, setLocalCities] = useState([]);
  const [localAreas, setLocalAreas] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (!cities?.length || !areas?.length) {
      (async () => {
        try {
          const [cRes, aRes] = await Promise.all([
            adminAPI.getCities(),
            adminAPI.getAreas("?limit=2000"),
          ]);
          setLocalCities(cRes?.data || []);
          setLocalAreas(aRes?.data || []);
        } catch (err) {
          console.error("Failed to load cities/areas for mapping:", err);
        }
      })();
    }
  }, [open, cities, areas]);

  const allCities = cities?.length ? cities : localCities;
  const allAreas = areas?.length ? areas : localAreas;

  const filteredAreas = allAreas.filter(
    (a) => !cityId || a.city?._id === cityId
  );

  function reset() {
    setScope("city");
    setCityId("");
    setAreaId("");
    setTemplateId("");
    setGlobalOffset("0");
    setLoading(false);
  }

  async function handleSubmit() {
    if (!templateId) {
      notify.error("Template is required");
      return;
    }

    if (scope === "city" && !cityId) {
      notify.error("City is required for city mapping");
      return;
    }

    if (scope === "area" && !areaId) {
      notify.error("Area is required for area mapping");
      return;
    }

    const payload = {
      scope,
      template: templateId,
      city: scope === "city" ? cityId : undefined,
      area: scope === "area" ? areaId : undefined,
      offsets: {
        global: Number(globalOffset) || 0,
      },
    };

    setLoading(true);
    try {
      const res = await adminAPI.createTimingMapping(payload);
      if (res?.success) {
        notify.success("Mapping created");
        onCreated?.(res.data);
        reset();
        onClose();
      } else {
        notify.error(res?.message || "Create failed");
      }
    } catch (err) {
      console.error(err);
      notify.error("Failed to create mapping");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create Timing Mapping"
      size="md"
    >
      <div className="space-y-4">
        {/* Scope */}
        <div>
          <label className="block text-sm font-medium mb-1">Scope</label>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={scope === "city"}
                onChange={() => setScope("city")}
              />
              <span>City (all areas)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={scope === "area"}
                onChange={() => setScope("area")}
              />
              <span>Specific Area</span>
            </label>
          </div>
        </div>

        {/* City / Area */}
        {scope === "city" ? (
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setAreaId("");
              }}
            >
              <option value="">Select City</option>
              {allCities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                City (filter)
              </label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  setAreaId("");
                }}
              >
                <option value="">All Cities</option>
                {allCities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
              >
                <option value="">Select Area</option>
                {filteredAreas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.city?.name || ""})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Template */}
        <div>
          <label className="block text-sm font-medium mb-1">Template</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            <option value="">Select Template</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Global offset */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Global Offset (minutes)
          </label>
          <input
            className="w-full border px-3 py-2 rounded"
            type="number"
            value={globalOffset}
            onChange={(e) => setGlobalOffset(e.target.value)}
            placeholder="e.g. 2 or -2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Applied to all slots for this city/area (&plusmn; minutes).
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-slate-700 text-white"
          >
            {loading ? "Saving…" : "Create Mapping"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
