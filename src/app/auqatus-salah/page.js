// src/app/auqatus-salah/page.js

import AuqatusSalahClient from "./AuqatusSalahClient";

export const metadata = {
  title: "Auqatus Salah (Prayer Times) | CitySalah",
  description:
    "View accurate Auqatus Salah prayer timings for your city and nearby areas including Sehri, Fajr, Zohar, Asar, Maghrib, and Isha.",
  alternates: {
    canonical: "https://citysalah.in/auqatus-salah",
  },
  openGraph: {
    title: "Auqatus Salah (Prayer Times) | CitySalah",
    description:
      "Daily Auqatus Salah timings by city and area. Accurate Islamic prayer time ranges.",
    url: "https://citysalah.in/auqatus-salah",
    siteName: "CitySalah",
    type: "website",
    images: [
      {
        url: "https://citysalah.in/api/og/auqatus-salah",
        width: 1200,
        height: 630,
        alt: "Auqatus Salah Prayer Timings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auqatus Salah | CitySalah",
    description:
      "Check accurate Auqatus Salah prayer timings for your city and nearby areas.",
    images: ["https://citysalah.in/api/og/auqatus-salah"],
  },
};

export default function AuqatusSalahPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Auqatus Salah (Prayer Times)",
    description:
      "Daily Auqatus Salah prayer timings including Sehri, Fajr, Zohar, Asar, Maghrib, and Isha.",
    url: "https://citysalah.in/auqatus-salah",
    isPartOf: {
      "@type": "WebSite",
      name: "CitySalah",
      url: "https://citysalah.in",
    },
    publisher: {
      "@type": "Organization",
      name: "CitySalah",
      url: "https://citysalah.in",
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuqatusSalahClient />
    </>
  );
}
