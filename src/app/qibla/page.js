// src/app/qibla/page.js

import QiblaResolverClient from "./QiblaResolverClient";

export const metadata = {
  title: "Qibla Direction Near You | CitySalah",
  robots: "noindex, follow",
};

export default function QiblaPage() {
  return <QiblaResolverClient />;
}
