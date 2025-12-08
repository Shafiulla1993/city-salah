// src/components/form/Select.js

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      disabled = false,
      className,
      name,
      required = false,
      placeholder,
    },
    ref
  ) => {
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-800 mb-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
            {label}
          </label>
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-white/40 bg-white/90 text-gray-800 shadow-lg hover:shadow-xl transition-all backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50",
            className
          )}
        >
          <option value="">
            {placeholder || `Select ${label?.toLowerCase() || "option"}`}
          </option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
