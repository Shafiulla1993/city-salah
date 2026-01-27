// src/app/dashboard/super-admin/manage/tabs/RamzanTab.js

"use client";

import { useEffect, useState } from "react";
import RamzanConfigForm from "../modules/ramzan/RamzanConfigForm";
import RamzanPreview from "../modules/ramzan/RamzanPreview";

export default function RamzanTab() {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/super-admin/cities?limit=1000").then((r) => r.json()),
      fetch("/api/super-admin/areas?limit=2000").then((r) => r.json()),
    ]).then(([c, a]) => {
      setCities(c.data || []);
      setAreas(a.data || []);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Ramzan Timetable Configuration
        </h2>
        <p className="text-sm text-gray-600">
          Configure Sehri & Iftar date range (derived from DayKey timings)
        </p>
      </div>

      <RamzanConfigForm cities={cities} areas={areas} onSaved={setConfig} />

      {config && <RamzanPreview config={config} />}
    </div>
  );
}
