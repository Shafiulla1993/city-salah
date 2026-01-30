// src/app/qibla/page.js
import QiblaResolverClient from "./QiblaResolverClient";

export const metadata = {
  title: "Qibla Direction Near You | CitySalah",
  description:
    "Find Qibla direction using your location and compass. Accurate Kaaba direction for prayer.",
  keywords: [
    "qibla direction",
    "kaaba direction",
    "qibla near me",
    "prayer direction",
  ],
  robots: "noindex, follow",
};

export default function Page() {
  return <QiblaResolverClient />;
}
