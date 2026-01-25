// src/app/[citySlug]/qibla/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import QiblaCityClient from "./QiblaCityClient";

export async function generateMetadata({ params }) {
  const { citySlug } = await params;

  const data = await serverFetch(`/api/public/qibla/city/${citySlug}`);

  const title = `Qibla Direction in ${data.city.name} | CitySalah`;
  const description = `Find the Qibla direction in ${data.city.name} using accurate geographic coordinates.`;
  const canonical = `https://citysalah.in/${citySlug}/qibla`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "CitySalah",
      type: "website",
    },
  };
}

export default async function Page({ params }) {
  const { citySlug } = await params;

  const data = await serverFetch(`/api/public/qibla/city/${citySlug}`);

  return (
    <QiblaCityClient
      city={data.city}
      lat={data.center.lat}
      lng={data.center.lng}
      areasCount={data.areasCount}
    />
  );
}
