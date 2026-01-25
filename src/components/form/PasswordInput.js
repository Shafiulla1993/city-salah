// src/components/form/PasswordInput.js
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ label, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  // ----- DESKTOP (HOLD to reveal) -----
  const handleMouseDown = () => setShowPassword(true);
  const handleMouseUp = () => setShowPassword(false);
  const handleMouseLeave = () => setShowPassword(false);

  // ----- MOBILE (TOGGLE to reveal) -----
  const handleTouchStart = () => setShowPassword((prev) => !prev); // toggle

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="font-semibold text-slate-800">{label}</label>}

      <div className="relative w-full">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-slate-800"
          autoComplete="current-password"
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
          // Desktop hold
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          // Mobile tap toggle
          onTouchStart={handleTouchStart}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
