// /src/app/masjid/[slug]/page.js


import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/http/serverFetch";


export async function generateMetadata({ params }) {
  const { slug } = await params; // ✅ FIX

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
  };
}

export default async function MasjidPage({ params }) {
  const { slug } = await params; // ✅ FIX

  const id = slug.split("-").pop();

  const masjids = await serverFetch("/api/public/masjids");
  const masjid = masjids.find((m) => m._id === id);

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
        prayer timings.
      </p>

      <ul className="mt-6 space-y-2">
        {Object.entries(timings).map(([k, v]) => (
          <li key={k} className="capitalize">
            <strong>{k}:</strong>{" "}
            {v?.azan || "-"}{" "}
            {v?.iqaamat ? `(Iqamat: ${v.iqaamat})` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}