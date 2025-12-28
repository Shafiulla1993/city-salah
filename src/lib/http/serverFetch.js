// src/lib/http/serverFetch.js
import { headers } from "next/headers";

export async function serverFetch(path) {
  const h = await headers();

  const isProd = process.env.NODE_ENV === "production";

  const baseUrl = isProd
    ? process.env.NEXT_PUBLIC_SITE_URL
    : (() => {
        const protocol = h.get("x-forwarded-proto") || "http";
        const host = h.get("x-forwarded-host") || h.get("host");
        if (!host) throw new Error("Cannot determine host");
        return `${protocol}://${host}`;
      })();

  if (!baseUrl) {
    throw new Error("Base URL not resolved");
  }

  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${url}`);
  }

  return res.json();
}
