// src/app/dashboard/super-admin/manage/modules/masjids/MasjidLocationPicker.js

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Modal from "@/components/admin/Modal";

// Dynamically import react-leaflet map components to avoid SSR crash
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

export default function MasjidLocationPicker({
  open,
  onClose,
  lat,
  lng,
  onSelect,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select Masjid Location"
      size="xl"
    >
      <div className="relative w-full h-[500px] rounded overflow-hidden">
        {open && (
          <LeafletMap
            lat={lat}
            lng={lng}
            onSelect={(lat, lng) => onSelect(lat, lng)}
            onClose={onClose}
          />
        )}
      </div>
    </Modal>
  );
}
