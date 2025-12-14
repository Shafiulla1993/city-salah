// src/components/masjid/MasjidCardBack.js

// src/components/masjid/MasjidCardBack.js
"use client";

import React, { useEffect } from "react";

/* ---------------- Prayer Card ---------------- */
function PrayerCard({ title, azan, iqaamat }) {
  return (
    <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 shadow-sm">
      <div className="font-bold text-stone-900 text-sm">{title}</div>
      <div className="text-xs text-stone-700">Azaan: {azan || "--"}</div>
      <div className="text-xs text-stone-700">Iqaamat: {iqaamat || "--"}</div>
    </div>
  );
}

/* ---------------- Contact Column ---------------- */
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
  const data = masjid?.fullDetails || masjid;

  const timings = data?.prayerTimings?.[0] || {};
  const contacts = data?.contacts || [];

  const imam = contacts.find((c) => c.role === "imam");
  const mozin = contacts.find((c) => c.role === "mozin");
  const mutawalli = contacts.find((c) => c.role === "mutawalli");

  const lng = data?.location?.coordinates?.[0];
  const lat = data?.location?.coordinates?.[1];

  const mapUrl =
    typeof lat === "number" && typeof lng === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : null;

  /* ---------------- SEO ---------------- */
  useEffect(() => {
    if (data?.name) {
      document.title = `${data.name} – ${data.area?.name}, ${data.city?.name} | Prayer Timings`;
    }
  }, [data]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-stone-300 rounded-2xl">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className="font-bold text-stone-900 text-base leading-tight">
          Masjid e {data?.name}
        </div>
        <div className="text-xs text-stone-800 text-right leading-tight">
          {data?.area?.name}
          <br />
          {data?.city?.name}
        </div>
      </div>

      {/* PRAYER TIMINGS */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <PrayerCard
          title="Fajr"
          azan={timings.fajr?.azan}
          iqaamat={timings.fajr?.iqaamat}
        />
        <PrayerCard
          title="Zohar"
          azan={timings.Zohar?.azan}
          iqaamat={timings.Zohar?.iqaamat}
        />
        <PrayerCard
          title="Asr"
          azan={timings.asr?.azan}
          iqaamat={timings.asr?.iqaamat}
        />
        <PrayerCard
          title="Maghrib"
          azan={timings.maghrib?.azan}
          iqaamat={timings.maghrib?.iqaamat}
        />
        <PrayerCard
          title="Isha"
          azan={timings.isha?.azan}
          iqaamat={timings.isha?.iqaamat}
        />
        <PrayerCard
          title="Juma"
          azan={timings.juma?.azan}
          iqaamat={timings.juma?.iqaamat}
        />
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
          {data?.address || "--"}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-4">
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-2 text-center"
          >
            <div className="font-bold text-sm">📍 Map</div>
            <div className="text-[10px] opacity-90">Open in Google Maps</div>
          </a>
        )}

        {data?._id && (
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/api/og/masjid/${data._id}`;
              if (navigator.share) {
                navigator.share({
                  title: `${data.name} Prayer Timings`,
                  text: `Prayer timings for ${data.name}`,
                  url: shareUrl,
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert("Prayer timings link copied!");
              }
            }}
            className="flex-1 bg-stone-800 hover:bg-stone-900 text-white rounded-xl py-2 px-2 text-center"
          >
            <div className="font-bold text-sm">📤 Share</div>
            <div className="text-[10px] opacity-90">Send prayer timings</div>
          </button>
        )}
      </div>
    </div>
  );
}
