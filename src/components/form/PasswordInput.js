// src/components/form/PasswordInput.js

"use client";

import { useState } from "react";
import { Input } from "./Input";
import { EyeIcon } from "lucide-react";

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  className = "",
  ...props
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {label && <label className="mb-1 font-medium">{label}</label>}

      <div className="relative w-full">
        <Input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`pr-12 ${className}`}
          {...props}
        />

        <button
          type="button"
          onMouseDown={() => setShow(true)}
          onMouseUp={() => setShow(false)}
          onMouseLeave={() => setShow(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
        >
          <EyeIcon size={20} />
        </button>
      </div>
    </div>
  );
}
