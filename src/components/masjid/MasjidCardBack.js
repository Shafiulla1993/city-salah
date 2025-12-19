// src/components/masjid/MasjidCardBack.js

"use client";

import React, { useEffect } from "react";
import { normalizePrayerTimings } from "@/lib/helpers/normalizePrayerTimings";

function PrayerCard({ title, azan, iqaamat }) {
  return (
    <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 shadow-sm">
      <div className="font-bold text-stone-900 text-sm">{title}</div>
      <div className="text-xs text-stone-700">Azaan: {azan || "--"}</div>
      <div className="text-xs text-stone-700">Iqaamat: {iqaamat || "--"}</div>
    </div>
  );
}

function ContactColumn({ title, contact }) {
  return (
    <div className="p-3">
      <div className="font-bold text-stone-900 text-sm mb-1">{title}</div>
      <div className="text-xs text-stone-800">{contact?.name || "--"}</div>
      <div className="text-xs text-stone-600">{contact?.phone || "--"}</div>
    </div>
  );
}

export default function MasjidCardBack({ masjid }) {
  const raw = masjid?.prayerTimings?.[0] || {};
  const timings = normalizePrayerTimings(raw);

  const contacts = masjid?.contacts || [];
  const imam = contacts.find((c) => c.role === "imam");
  const mozin = contacts.find((c) => c.role === "mozin");
  const mutawalli = contacts.find((c) => c.role === "mutawalli");

  const lng = masjid?.location?.coordinates?.[0];
  const lat = masjid?.location?.coordinates?.[1];

  const mapUrl =
    typeof lat === "number" && typeof lng === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : null;

  useEffect(() => {
    if (masjid?.name) {
      document.title = `${masjid.name} – ${masjid.area?.name}, ${masjid.city?.name} | CitySalah`;
    }
  }, [masjid]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-stone-300 rounded-2xl">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className="font-bold text-stone-900 text-base leading-tight">
          Masjid e {masjid?.name}
        </div>
        <div className="text-xs text-stone-800 text-right leading-tight">
          {masjid?.area?.name}
          <br />
          {masjid?.city?.name}
        </div>
      </div>

      {/* PRAYERS */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <PrayerCard title="Fajr" {...timings.fajr} />
        <PrayerCard title="Zohar" {...timings.zohar} />
        <PrayerCard title="Asr" {...timings.asr} />
        <PrayerCard title="Maghrib" {...timings.maghrib} />
        <PrayerCard title="Isha" {...timings.isha} />
        <PrayerCard title="Juma" {...timings.juma} />
      </div>

      {/* CONTACTS */}
      <div className="mb-5">
        <div className="font-bold text-stone-900 text-sm mb-2">Contacts</div>
        <div className="grid grid-cols-3 bg-stone-100 rounded-xl divide-x border border-stone-300">
          <ContactColumn title="Imam" contact={imam} />
          <ContactColumn title="Mozin" contact={mozin} />
          <ContactColumn title="Zimmedar" contact={mutawalli} />
        </div>
      </div>

      {/* ADDRESS */}
      <div className="mb-4">
        <div className="font-bold text-stone-900 text-sm mb-1">Address</div>
        <div className="text-xs text-stone-800 leading-relaxed">
          {masjid?.address || "--"}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-4">
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-center"
          >
            📍 Map
          </a>
        )}

        {masjid?._id && (
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/api/og/masjid/${masjid._id}`;
              navigator.clipboard.writeText(shareUrl);
              alert("Prayer timings link copied!");
            }}
            className="flex-1 bg-stone-800 text-white rounded-xl py-2 text-center"
          >
            📤 Share
          </button>
        )}
      </div>
    </div>
  );
}
