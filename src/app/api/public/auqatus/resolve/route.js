// src/app/api/public/auqatus/resolve/route.js

// src/app/api/public/auqatus/resolve/route.js

import connectDB from "@/lib/db";
import { resolveAreaFromCoords } from "@/lib/location/resolveAreaFromCoords";
import { resolveCityFromCoords } from "@/lib/location/resolveCityFromCoords";
import { reverseGeocode } from "@/lib/location/reverseGeocode";
import { generateSlug } from "@/lib/helpers/slugHelper";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  // ✅ correct validation
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ success: false }, { status: 400 });
  }

  // 1️⃣ Area resolution (DB, radius-based)
  const areaMatch = await resolveAreaFromCoords({
    lat,
    lng,
    maxRadiusKm: 30,
  });

  if (areaMatch) {
    return Response.json({
      success: true,
      type: "area",
      citySlug: areaMatch.city.slug,
      areaSlug: areaMatch.area.slug,
    });
  }

  // 2️⃣ Reverse geocode
  const geo = await reverseGeocode(lat, lng);
  const cityName = geo?.cityName || geo?.state || geo?.county;

  if (!cityName) {
    return Response.json({ success: false });
  }

  // 3️⃣ City from DB
  const cityMatch = await resolveCityFromCoords({
    cityNameFromGeo: cityName,
  });

  if (cityMatch) {
    return Response.json({
      success: true,
      type: "city",
      citySlug: cityMatch.city.slug,
    });
  }

  // 4️⃣ Geo city (not in DB)
  return Response.json({
    success: true,
    type: "geo-city",
    citySlug: generateSlug(cityName),
    cityName,
    supported: false,
  });
}
