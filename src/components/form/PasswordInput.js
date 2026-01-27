// src/components/form/PasswordInput.js
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PasswordInput({ label, className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  // Desktop: hold to reveal
  const handleMouseDown = () => setShowPassword(true);
  const handleMouseUp = () => setShowPassword(false);
  const handleMouseLeave = () => setShowPassword(false);

  // Mobile: tap to toggle
  const handleTouchStart = () => setShowPassword((prev) => !prev);

  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 font-medium">{label}</label>}

      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pr-10",
            className,
          )}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
