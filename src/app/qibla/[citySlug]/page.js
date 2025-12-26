// src/app/qibla/[cityslug]/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import { notFound } from "next/navigation";
import QiblaCityClient from "./QiblaCityClient";

export const dynamic = "force-dynamic";

/* ===========================
   SEO METADATA
=========================== */
export async function generateMetadata({ params }) {
  const cities = await serverFetch("/api/public/cities");
  const city = cities.find((c) => c.slug === params.citySlug);

  if (!city) return {};

  return {
    title: `Qibla Direction in ${city.name} | CitySalah`,
    description: `Find accurate Qibla direction in ${city.name}.`,
    alternates: {
      canonical: `https://citysalah.in/qibla/${city.slug}`,
    },
  };
}

/* ===========================
   PAGE
=========================== */
export default async function Page({ params }) {
  const cities = await serverFetch("/api/public/cities");
  const city = cities.find((c) => c.slug === params.citySlug);

  if (!city) return notFound();

  return <QiblaCityClient city={city} />;
}
