// src/lib/location/reverseGeocode.js

export async function reverseGeocode(lat, lng) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lng);
    url.searchParams.set("zoom", 10);
    url.searchParams.set("addressdetails", 1);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "CitySalah/1.0 (info@citysalah.in)",
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      null;

    return {
      cityName: city,
      state: addr.state || null,
      country: addr.country || null,
      lat,
      lng,
    };
  } catch (e) {
    console.error("Reverse geocode failed:", e);
    return null;
  }
}
