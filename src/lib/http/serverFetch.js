// src/lib/http/serverFetch.js
// src/lib/http/serverFetch.js
import { headers } from "next/headers";

/**
 * serverFetch
 *
 * - Dev  → always uses http://localhost:3000
 * - Prod → uses NEXT_PUBLIC_SITE_URL
 *
 * This avoids:
 * - SSL certificate issues in dev
 * - Invalid URL errors in Node
 * - Proxy / header edge cases
 */
export async function serverFetch(path, options = {}) {
  const isProd = process.env.NODE_ENV === "production";

  let baseUrl;

  if (isProd) {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not defined in production");
    }
  } else {
    // ✅ FORCE LOCALHOST IN DEV (no SSL, no cert issues)
    baseUrl = "http://localhost:3000";
  }

  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    next: options.next ?? { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed (${res.status}): ${url}`);
  }

  return res.json();
}
