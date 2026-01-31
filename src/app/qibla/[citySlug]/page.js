// src/app/qibla/[citySlug]/page.js


import { permanentRedirect } from "next/navigation";

export default async function LegacyQiblaCityRedirect({ params }) {
  const { citySlug } = await params;

  // normalize (safety)
  const normalizedCity = citySlug.toLowerCase();

  // 301 redirect to canonical city Qibla page
  permanentRedirect(`/${normalizedCity}/qibla`);
}
