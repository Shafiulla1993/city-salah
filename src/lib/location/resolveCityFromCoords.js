// src/lib/location/resolveCityFromCoords.js

import City from "@/models/City";

export async function resolveCityFromCoords({ cityNameFromGeo }) {
  if (!cityNameFromGeo) return null;

  const city = await City.findOne({
    name: { $regex: `^${cityNameFromGeo}$`, $options: "i" },
  });

  if (!city) return null;

  return { city };
}
