// src/app/qibla/page.js

import QiblaClient from "./QiblaClient";

export const metadata = {
  title: "Qibla Direction | CitySalah",
  description:
    "Find accurate Qibla direction using your phone compass.",
};

export default function QiblaPage() {
  return <QiblaClient />;
}
