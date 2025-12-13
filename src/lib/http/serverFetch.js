// src/lib/http/serverFetch.js

export async function serverFetch(path) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(base + path, {
    next: { revalidate: 86400 }, // 24 hours
  });

  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}
