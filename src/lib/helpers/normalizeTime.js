// src/lib/helpers/normalizeTime.js

export function normalizeTime(input, prayer) {
  if (!input) return "";
  let str = String(input).trim().replace(".", ":");
  let [h, m = "00"] = str.split(":");

  let hour = parseInt(h, 10);
  let minute = parseInt(m, 10) || 0;
  if (Number.isNaN(hour)) return "";

  hour = hour % 12 || 12;
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");

  const suffix = prayer === "fajr" ? "AM" : "PM";
  return `${hh}:${mm} ${suffix}`;
}
