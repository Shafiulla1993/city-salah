// src/lib/location/reverseGeocode.js

export async function reverseGeocode(lat, lng) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "CitySalah/1.0 (info@citysalah.in)",
        "Accept-Language": "en", // 🔴 THIS
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};

    return {
      cityName:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.city_district ||
        null,
      state: addr.state || null,
      county: addr.county || null,
    };
  } catch {
    return null;
  }
}
