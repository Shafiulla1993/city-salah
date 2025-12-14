// src/app/city/[citySlug]/area/[areaSlug]/page.js

import { redirect, notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";

export async function generateMetadata({ params }) {
  const { citySlug, areaSlug } = await params;

  const city = citySlug.replace(/-/g, " ");
  const area = areaSlug.replace(/-/g, " ");

  return {
    title: `Masjids in ${area}, ${city} | CitySalah`,
    description: `Find masjids and prayer timings in ${area}, ${city}.`,
    alternates: {
      canonical: `https://citysalah.in/city/${citySlug}/area/${areaSlug}`,
    },
  };
}

export default async function AreaPage({ params }) {
  const { citySlug, areaSlug } = await params;

  // 🔒 Validate area exists (keeps Google happy)
  const areas = await serverFetch("/api/public/allareas");

  const area = areas.find(
    (a) =>
      a.city.toLowerCase().replace(/\s+/g, "-") === citySlug &&
      a.name.toLowerCase().replace(/\s+/g, "-") === areaSlug
  );

  if (!area) notFound();

  // ✅ SOFT REDIRECT (UX only)
  redirect(`/?city=${citySlug}&area=${areaSlug}`);
}
