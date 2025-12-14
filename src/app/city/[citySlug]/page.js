// src/app/city/[citySlug]/page.js

import { redirect, notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";

export async function generateMetadata({ params }) {
  const { citySlug } = await params;

  const cityName = citySlug.replace(/-/g, " ");

  return {
    title: `${cityName} Masjids & Prayer Timings | CitySalah`,
    description: `Find masjids and prayer timings in ${cityName}.`,
    alternates: {
      canonical: `https://citysalah.in/city/${citySlug}`,
    },
  };
}

export default async function CityPage({ params }) {
  const { citySlug } = await params;

  // 🔒 Validate city exists (important for SEO correctness)
  const cities = await serverFetch("/api/public/cities");
  const city = cities.find((c) => c.slug === citySlug);

  if (!city) notFound();

  // ✅ SOFT REDIRECT (UX only)
  redirect(`/?city=${citySlug}`);
}
