"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * MasjidSearchBar
 *
 * PROPS:
 * - value
 * - onChange(text)
 * - onSelect(resultObj)
 * - onFocus()
 * - results = [{ _id, name, areaName, cityName }]
 * - showResults
 */

export default function MasjidSearchBar({
  value = "",
  onChange = () => {},
  onSelect = () => {},
  onFocus = () => {},
  results = [],
  showResults = false,
}) {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(showResults);

  useEffect(() => {
    setOpen(showResults);
  }, [showResults]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* INPUT */}
      <input
        value={value}
        placeholder="Search masjid…"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setOpen(true);
          onFocus();
        }}
        className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
      />

      {/* RESULTS */}
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl shadow-xl bg-white border border-slate-200 z-50"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {results.map((r) => (
            <div
              key={r._id}
              onClick={() => {
                onSelect(r);
                setOpen(false);
              }}
              className="px-4 py-3 text-sm cursor-pointer select-none hover:bg-indigo-50 active:bg-indigo-100"
            >
              <div className="font-semibold text-slate-900">{r.name}</div>

              <div className="text-xs text-slate-500 mt-0.5">
                {r.areaName ? `${r.areaName}, ` : ""}
                {r.cityName || ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NO RESULTS */}
      {open && results.length === 0 && value.trim() !== "" && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl shadow-xl bg-white border border-slate-200 px-4 py-4 text-sm text-slate-500 z-50">
          No masjid found
        </div>
      )}
    </div>
  );
}
