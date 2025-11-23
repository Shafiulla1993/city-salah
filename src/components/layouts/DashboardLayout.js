// src/components/Layouts/DashboardLayout.js
"use client"; 

import React from "react";

export default function DashboardLayout({ left, right }) {
  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 p-4 min-h-screen bg-slate-300/40 backdrop-blur-xl shadow-2xl rounded-2xl w-full">
      {/* Left Panel - Desktop shows left second in mobile reversed */}
      <div className="md:w-2/5 w-full space-y-4">{left}</div>

      {/* Right Panel */}
      <div className="md:w-3/5 w-full space-y-4">{right}</div>
    </div>
  );
}
