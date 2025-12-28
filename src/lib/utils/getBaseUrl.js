// src/lib/utils/getBaseUrl.js

import { headers } from "next/headers";

export async function getBaseUrl() {
  const h = await headers(); // ✅ MUST await

  const host = h.get("x-forwarded-host") || h.get("host");

  const proto =
    process.env.NODE_ENV === "development"
      ? "http"
      : h.get("x-forwarded-proto") || "https";

  return `${proto}://${host}`;
}
