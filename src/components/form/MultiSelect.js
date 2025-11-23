// src/components/form/MultiSelect.js

"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Props:
 * - options: [{ value, label }]
 * - value: [value] (selected values)
 * - onChange: (newValuesArray) => void
 * - placeholder
 */
export default function MultiSelect({
  options = [],
  value = [],
  onChange = () => {},
  placeholder = "Select...",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const selectedSet = new Set(value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.value.toString().toLowerCase().includes(query.toLowerCase())
  );

  function toggleOption(opt) {
    const next = value.includes(opt.value)
      ? value.filter((v) => v !== opt.value)
      : [...value, opt.value];
    onChange(next);
  }

  function removeTag(val) {
    onChange(value.filter((v) => v !== val));
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "min-h-[44px] bg-slate-100/40 rounded-md border border-input px-3 py-2 flex items-center gap-2 flex-wrap",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        {value && value.length ? (
          <>
            {value.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="flex items-center gap-2 bg-slate-700 text-white text-xs rounded-full px-2 py-1"
                >
                  <span>{opt?.label ?? val}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(val);
                    }}
                    className="text-[10px] opacity-80"
                    aria-label="remove"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="bg-transparent flex-1 min-w-[80px] outline-none text-sm px-1"
            />
          </>
        ) : (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="bg-transparent flex-1 outline-none text-sm px-1"
          />
        )}
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-white/90 backdrop-blur rounded-md shadow-md border border-white/30 z-50 max-h-56 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map((opt) => {
              const isSelected = selectedSet.has(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between"
                >
                  <div className="text-sm">{opt.label}</div>
                  {isSelected && <div className="text-xs text-slate-700">Selected</div>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
