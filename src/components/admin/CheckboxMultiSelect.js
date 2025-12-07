// src/components/admin/CheckboxMultiSelect.js

"use client";
import { useState, useMemo } from "react";

export default function CheckboxMultiSelect({
  label,
  items = [],
  selected = [],
  onChange,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const allSelected = selected.length === items.length && items.length > 0;

  function toggleSelectAll() {
    onChange(allSelected ? [] : items.map((i) => i._id));
  }

  function toggleSingle(id) {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  }

  return (
    <div className="w-full border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <button
          type="button"
          onClick={toggleSelectAll}
          className="text-xs px-2 py-1 bg-slate-700 text-white rounded"
        >
          {allSelected ? "Unselect All" : "Select All"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-md px-2 py-1 text-sm"
      />

      <div className="overflow-y-auto mt-1" style={{ maxHeight: 220 }}>
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-500 px-1 py-2">No results</p>
        ) : (
          filtered.map((item) => (
            <label
              key={item._id}
              className="flex items-center space-x-2 py-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(item._id)}
                onChange={() => toggleSingle(item._id)}
              />
              <span className="text-sm">{item.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
