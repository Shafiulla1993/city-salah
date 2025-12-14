// src/app/masjid/[slug]/page.js

import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";
import ClientMasjidRedirect from "./ClientMasjidRedirect";

export async function generateMetadata({ params }) {
  const { slug } = await params; // ✅ REQUIRED in Next 16
  const id = slug.split("-").pop();

  const masjid = await serverFetch(`/api/public/masjids/${id}`);
  if (!masjid) return {};

  const city = masjid.city?.name || "";
  const area = masjid.area?.name || "";

  return {
    title: `${masjid.name}, ${area}, ${city} – Prayer Timings | CitySalah`,
    description: `View prayer timings, Jummah details, and contact information for ${masjid.name} in ${area}, ${city}.`,
    alternates: {
      canonical: `https://citysalah.in/masjid/${masjid.slug}-${masjid._id}`,
    },
    openGraph: {
      images: [
        {
          url: `https://citysalah.in/api/og/masjid/${
            masjid._id
          }?name=${encodeURIComponent(masjid.name)}&area=${encodeURIComponent(
            masjid.area?.name || ""
          )}&city=${encodeURIComponent(masjid.city?.name || "")}`,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${masjid.name} – CitySalah`,
      description: `Prayer timings for ${masjid.name}`,
      images: [`https://citysalah.in/api/og/masjid/${masjid._id}`],
    },
  };
}

export default async function MasjidPage({ params }) {
  const { slug } = await params; // ✅ REQUIRED in Next 16
  const id = slug.split("-").pop();

  const masjid = await serverFetch(`/api/public/masjids/${id}`);
  if (!masjid) notFound();

  return <ClientMasjidRedirect masjid={masjid} />;
}
