// src/components/qibla/CalibrationHelper.js

"use client";

export default function CalibrationHelper({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white px-6 text-center">
      
      {/* Animated 8 */}
      <div className="w-20 h-20 mb-6 animate-pulse">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M50 10
                   C20 10, 20 50, 50 50
                   C80 50, 80 90, 50 90
                   C20 90, 20 50, 50 50
                   C80 50, 80 10, 50 10" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold mb-2">
        Calibrate Compass
      </h2>

      <p className="text-white/70 max-w-sm">
        Move your phone in a gentle <strong>figure-8 motion</strong> to improve compass accuracy.
      </p>
    </div>
  );
}
