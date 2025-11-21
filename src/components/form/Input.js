"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(
  ({ label, type = "text", className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && <label className="mb-1 font-medium">{label}</label>}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props} // ⚠ Make sure value & onChange are passed in props
        />
      </div>
    );
  }
);

Input.displayName = "Input";
