// src/lib/location/resolveAreaFromCoords.js

import Area from "@/models/Area";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function resolveAreaFromCoords({ lat, lng, maxRadiusKm = 30 }) {
  const areas = await Area.find({
    "center.coordinates.0": { $ne: null },
    "center.coordinates.1": { $ne: null },
  }).populate("city");

  let best = null;
  let bestDist = Infinity;

  for (const area of areas) {
    const areaLng = area.center.coordinates[0];
    const areaLat = area.center.coordinates[1];

    const d = distanceKm(lat, lng, areaLat, areaLng);

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
