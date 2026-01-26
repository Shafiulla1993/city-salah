// src/app/qibla/your-location/page.js

import QiblaClient from "@/app/qibla/QiblaClient";

export const metadata = {
  title:
    "Qibla Direction From Your Location | Kaaba Direction & Prayer Compass",
  description:
    "Find the accurate Qibla direction from your current location. This page answers: Where is Qibla from here? Which way to face for Salah right now? Use GPS and compass to know the exact Kaaba direction from your position.",
  keywords: [
    "Qibla direction from my location",
    "Qibla near me",
    "Where is Qibla from here",
    "Kaaba direction from my location",
    "Prayer direction from my location",
    "Which way is Qibla",
    "Qibla compass online",
    "Direction of Makkah from my location",
    "Find Qibla using GPS",
    "Islamic prayer direction near me",
  ].join(", "),
  alternates: {
    canonical: "https://citysalah.in/qibla/your-location",
  },
  openGraph: {
    title: "Qibla Direction From Your Location",
    description:
      "Accurate Qibla (Kaaba) direction from your current GPS location. Learn which direction to face for prayer using live compass and location.",
    url: "https://citysalah.in/qibla/your-location",
    type: "website",
  },
};

export default function Page() {
  return <QiblaClient cityName="Your Location" areaName="Your Area" />;
}
