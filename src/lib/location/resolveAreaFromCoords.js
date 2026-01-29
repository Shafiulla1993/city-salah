// src/lib/location/resolveAreaFromCoords.js

import Area from "@/models/Area";
import City from "@/models/City";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function resolveAreaFromCoords({ lat, lng, maxRadiusKm = 15 }) {
  const areas = await Area.find({
    "coords.lat": { $ne: null },
    "coords.lon": { $ne: null },
  }).populate("city");

  let best = null;
  let bestDist = Infinity;

  for (const area of areas) {
    const d = distanceKm(lat, lng, area.coords.lat, area.coords.lon);
    if (d < bestDist) {
      best = area;
      bestDist = d;
    }
  }

  if (best && bestDist <= maxRadiusKm) {
    return { area: best, city: best.city, distance: bestDist };
  }

  return null;
}
