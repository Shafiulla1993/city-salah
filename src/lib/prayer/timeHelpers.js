// src/lib/prayer/timeHelpers.js
export function hhmmToMinutes(hhmm) {
  // accepts "HH:mm" 24-hour or "hh:mm A" (we'll parse only "HH:mm")
  const parts = String(hhmm).trim().split(":");
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  return hh * 60 + mm;
}

export function minutesToHHMM(mins) {
  const m = Number(mins) || 0;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; // 24-hr
}

export function minutesToAMPM(mins) {
  const m = Number(mins) || 0;
  let hh = Math.floor(m / 60);
  const mm = m % 60;
  const am = hh < 12;
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  const suffix = am ? "AM" : "PM";
  return `${String(hour12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${suffix}`;
}
