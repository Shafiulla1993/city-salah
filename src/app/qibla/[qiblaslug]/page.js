// src/app/qibla/[qiblaslug]/page.js

import QiblaClient from "../QiblaClient";
import { serverFetch } from "@/lib/http/serverFetch";

export async function generateMetadata({ params }) {
  const area = await serverFetch(`/api/public/areas/${params.slug}`);

  return {
    title: `Qibla Direction in ${area.name} | CitySalah`,
    description: `Find accurate Qibla direction for ${area.name}.`,
  };
}

export default async function QiblaAreaPage({ params }) {
  const area = await serverFetch(`/api/public/areas/${params.slug}`);

  return (
    <QiblaClient
      presetLocation={{
        lat: area.location.coordinates[1],
        lng: area.location.coordinates[0],
      }}
      label={area.name}
    />
  );
}
