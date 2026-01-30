// src/app/dashboard/super-admin/manage/tabs/HijriTab.js

"use client";

import { useEffect, useState } from "react";
import { notify } from "@/lib/toast";

import CityHijriOverrides from "../modules/hijri/CityHijriOverrides";
import HijriPreviewCard from "../modules/hijri/HijriPreviewCard";

export default function HijriTab() {
  const [settings, setSettings] = useState([]);
  const [globalOffset, setGlobalOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
    try {
      const res = await fetch("/api/super-admin/hijri-settings", {
        credentials: "include",
      });
      const json = await res.json();

      const global = json.data.find((s) => s.scope === "global");
      setSettings(Array.isArray(json.data) ? json.data : []);

      setGlobalOffset(global?.hijriOffset ?? 0);
    } catch (e) {
      notify.error("Failed to load Hijri settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveGlobal() {
    setSaving(true);
    try {
      const res = await fetch("/api/super-admin/hijri-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "global",
          hijriOffset: Number(globalOffset),
        }),
      });

      const json = await res.json();
      if (json.success) {
        notify.success("Global Hijri offset saved");
        loadSettings();
      } else {
        notify.error(json.message || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-8">
      {/* Preview */}
      <HijriPreviewCard globalOffset={globalOffset} />

      {/* Global */}
      <div>
        <h2 className="text-lg font-semibold">Global Hijri Offset</h2>
        <p className="text-sm text-gray-600 mb-3">
          Used when no city-specific override exists
        </p>

        <div className="flex items-center gap-3">
          <select
            className="border px-3 py-2 rounded"
            value={globalOffset}
            onChange={(e) => setGlobalOffset(e.target.value)}
          >
            {[-2, -1, 0, 1, 2].map((v) => (
              <option key={v} value={v}>
                {v > 0 ? `+${v}` : v}
              </option>
            ))}
          </select>

          <button
            onClick={saveGlobal}
            disabled={saving}
            className="px-4 py-2 rounded bg-slate-700 text-white"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* City overrides */}
      <CityHijriOverrides settings={settings} onChange={loadSettings} />
    </div>
  );
}
