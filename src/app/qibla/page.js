// src/app/qibla/page.js

import QiblaClient from "./QiblaClient";

export const metadata = {
  title: "Qibla Direction | CitySalah",
  description:
    "Find accurate Qibla direction for Mysore and nearby areas using your location.",
};

export default function QiblaPage() {
  return <QiblaClient />;
}
