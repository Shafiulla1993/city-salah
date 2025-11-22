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
      <div className={label ? "flex flex-col" : "flex"}>
        {label && (
          <label className="mb-1 text-sm font-medium text-gray-700">
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
            "flex h-10 w-full rounded-md border border-input bg-slate-100/40 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 disabled:opacity-50",
            className
          )}
        >
          {/* Placeholder */}
          <option value="">
            {placeholder || `Select ${label?.toLowerCase() || "option"}`}
          </option>
          {options.map((opt) => (
            <option key={opt._id} value={opt._id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
