// src/lib/prayer/timeHelpers.js
export function hhmmToMinutes(hhmm) {
  const parts = String(hhmm).trim().split(":");
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  return hh * 60 + mm;
}

export function minutesToHHMM(mins) {
  const m = Number(mins) || 0;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
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

/* ---------------------------------------------
   Convert "05:55 PM" → "17:55"
--------------------------------------------- */
export function to24Hour(timeStr) {
  if (!timeStr) return "";

  const str = String(timeStr).trim().toUpperCase();

  // Already 24-hour (e.g. "17:55")
  if (!str.includes("AM") && !str.includes("PM")) {
    return str;
  }

  const [time, modifier] = str.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
