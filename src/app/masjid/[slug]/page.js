// /src/app/masjid/[slug]/page.js

import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";

export async function generateMetadata({ params }) {
  const slug = params.slug;
  const id = slug.split("-").pop();

  const masjid = await serverFetch(`/api/public/masjids/${id}`);
  if (!masjid) return {};

  const city = masjid.city?.name || "";
  const area = masjid.area?.name || "";

  const title = `${masjid.name}, ${area}, ${city} – Prayer Timings | CitySalah`;
  const description = `View iqaamat times, prayer schedule, and contact details for ${masjid.name} in ${area}, ${city}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://citysalah.in/masjid/${masjid.slug}-${masjid._id}`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: `https://citysalah.in/api/og/masjid/${masjid._id}`,
          width: 1080,
          height: 1920,
        },
      ],
    },
  };
}

export default async function MasjidPage({ params }) {
  const slug = params.slug;
  const id = slug.split("-").pop();

  const masjid = await serverFetch(`/api/public/masjids/${id}`);
  if (!masjid) notFound();

  const timings = masjid.prayerTimings?.[0] || {};
  const city = masjid.city?.name;
  const area = masjid.area?.name;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">
        {masjid.name}, {area}, {city}
      </h1>

      <p className="mt-4 text-gray-700">
        {masjid.name} is located in {area}, {city}. Below are the daily
        prayer iqaamat timings.
      </p>

      <ul className="mt-6 space-y-2">
        {Object.entries(timings).map(([k, v]) => (
          <li key={k} className="capitalize">
            <strong>{k}:</strong>{" "}
            {v?.iqaamat || "--"}
          </li>
        ))}
      </ul>
    </main>
  );
}
