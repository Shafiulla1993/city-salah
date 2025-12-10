// src/lib/http/serverFetch.js

export async function serverFetch(path) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const url = base + path;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) throw new Error(`Failed fetch: ${url}`);

  return res.json();
}
