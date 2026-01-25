// src/app/qibla/[citySlug]/page.js

import { redirect } from "next/navigation";

export const metadata = {
  robots: "noindex, follow",
};

export default function LegacyCityQiblaRedirect({ params }) {
  const { citySlug } = params;
  redirect(`/${citySlug}/qibla`);
}
