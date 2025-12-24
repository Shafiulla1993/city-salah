// src/lib/http/serverFetch.js

import { headers } from "next/headers";

export async function serverFetch(path) {
  const h = await headers();

  const protocol = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host");

  if (!host) {
    throw new Error("Cannot determine host");
  }

  const url = `${protocol}://${host}${path}`;

  const res = await fetch(url, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${url}`);
  }

  const json = await res.json();

  // ✅ NEW: allow object responses (masjid, city, area)
  if (json && typeof json === "object") return json;

  throw new Error(`Unexpected API response shape: ${url}`);
}
