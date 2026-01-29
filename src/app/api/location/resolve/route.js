// src/app/api/location/resolve/route.js

import connectDB from "@/lib/db";
import Area from "@/models/Area";
import City from "@/models/City";
import { reverseGeocode } from "@/lib/location/reverseGeocode";

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

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!lat || !lng) {
    return Response.json({ success: false }, { status: 400 });
  }

  // 1️⃣ Try Area first (PRIMARY)
  const areas = await Area.find({
    "center.coordinates.0": { $ne: null },
    "center.coordinates.1": { $ne: null },
  }).populate("city");

  let nearestArea = null;
  let nearestDist = Infinity;

  for (const area of areas) {
    const areaLng = area.center.coordinates[0]; // GeoJSON: [lng, lat]
    const areaLat = area.center.coordinates[1];

    const d = distanceKm(lat, lng, areaLat, areaLng);

    if (d < nearestDist) {
      nearestArea = area;
      nearestDist = d;
    }
  }

  // Radius in KM – covers whole Mysore comfortably
  if (nearestArea && nearestDist <= 30) {
    return Response.json({
      success: true,
      type: "area",
      citySlug: nearestArea.city.slug,
      areaSlug: nearestArea.slug,
      distance: nearestDist,
    });
  }

  /* 2️⃣ Fallback to City by reverse geocode */
  const geo = await reverseGeocode(lat, lng);
  if (!geo?.cityName) {
    return Response.json({ success: false, type: "unknown" });
  }

  const cities = await City.find({});

  let bestCity = null;
  let bestCityDist = Infinity;

  for (const city of cities) {
    const d = distanceKm(lat, lng, city.coords.lat, city.coords.lon);

    if (city.name.toLowerCase().includes(geo.cityName.toLowerCase())) {
      bestCity = city;
      break;
    }

    if (d < bestCityDist) {
      bestCity = city;
      bestCityDist = d;
    }
  }

  if (bestCity) {
    return Response.json({
      success: true,
      type: "city",
      citySlug: bestCity.slug,
    });
  }

  return Response.json({ success: false, type: "unknown" });
}
