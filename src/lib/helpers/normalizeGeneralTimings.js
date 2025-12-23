// src/lib/helpers/normalizeGeneralTimings.js

function minutesNow() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function normalizeGeneralTimings(timings) {
  if (!timings?.slots?.length) return [];

  const now = minutesNow();
  const map = Object.fromEntries(timings.slots.map((s) => [s.name, s.time]));

  const slots = [
    { label: "Sehri", start: map.sehri_start, end: map.sehri_end },
    { label: "Fajr", start: map.fajr_start, end: map.fajr_end },
    { label: "Ishraq", start: map.ishraq_start, end: map.ishraq_end },
    { label: "Chasht", start: map.chasht_start, end: map.chasht_end },
    { label: "Zawaal", start: map.zawaal_start, end: map.zawaal_end },
    { label: "Zohar", start: map.zohar_start, end: map.zohar_end },
    {
      label: "Asr (Shafi)",
      start: map.asar_shafi_start,
      end: map.asar_shafi_end,
    },
    {
      label: "Asr (Hanafi)",
      start: map.asar_hanafi_start,
      end: map.asar_hanafi_end,
    },
    { label: "Maghrib", start: map.maghrib_start, end: map.maghrib_end },
    { label: "Isha", start: map.isha_start, end: map.isha_end },
  ].filter((s) => s.start !== undefined && s.end !== undefined);

  return slots.map((s) => ({
    ...s,
    highlight:
      s.start <= s.end
        ? now >= s.start && now < s.end
        : now >= s.start || now < s.end, // handles overnight ranges
  }));
}
