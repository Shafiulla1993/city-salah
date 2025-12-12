// src/utils/prayerSorting.js
// IMPROVED SORTING for masjids by next iqaamat time
// Ensures correct chronological ordering

// Slug for SEO-friendly URLs (kept as-is from your version)
export function slugifyForUrl(s) {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Convert HH:MM → minutes
function toMinutes(str) {
  if (!str) return null;
  const [h, m] = str.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// MAIN SORT FUNCTION
export function sortMasjidsByNext(list = []) {
  return [...list].sort((a, b) => {
    const ta = toMinutes(a?.nextPrayer?.timeStr);
    const tb = toMinutes(b?.nextPrayer?.timeStr);

    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;

    return ta - tb;
  });
}
