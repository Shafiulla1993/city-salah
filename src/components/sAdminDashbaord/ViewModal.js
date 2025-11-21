// src/components/Dashboard/ViewModal.js
"use client";

import React from "react";

export default function ViewModal({ item = {}, type, onClose }) {
  // A simple read-only display. Customize fields per `type` if needed.
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Details</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            &times;
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-800">
          <div>
            <div className="text-xs text-gray-500">Name</div>
            <div className="font-medium">{item.name ?? "-"}</div>
          </div>

          {type === "masjids" && (
            <>
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div>{item.address ?? "-"}</div>
              </div>
            </>
          )}

          {(type === "areas" || type === "masjids" || type === "users") && (
            <div>
              <div className="text-xs text-gray-500">City</div>
              <div>
                {(item.city && (item.city.name ?? item.city)) ??
                  item.city ??
                  "-"}
              </div>
            </div>
          )}

          {(type === "masjids" || type === "users") && (
            <div>
              <div className="text-xs text-gray-500">Area</div>
              <div>
                {(item.area && (item.area.name ?? item.area)) ??
                  item.area ??
                  "-"}
              </div>
            </div>
          )}

          {type === "users" && (
            <>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div>{item.email ?? "-"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div>{item.phone ?? "-"}</div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
