// src/lib/location/resolveCityFromCoords.js

import City from "@/models/City";

/* Haversine distance (km) */
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

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function resolveCityFromCoords({
  lat,
  lng,
  cityNameFromGeo,
  maxRadiusKm = 50,
}) {
  const cities = await City.find({
    lat: { $ne: null },
    lng: { $ne: null },
  });

  let best = null;
  let bestDist = Infinity;

  for (const city of cities) {
    const d = distanceKm(lat, lng, city.lat, city.lng);

    // Prefer name match first
    if (
      cityNameFromGeo &&
      city.name.toLowerCase().includes(cityNameFromGeo.toLowerCase())
    ) {
      return { city, distance: d };
    }

    if (d < bestDist) {
      best = city;
      bestDist = d;
    }
  }

  if (best && bestDist <= maxRadiusKm) {
    return { city: best, distance: bestDist };
  }

  return null;
}
