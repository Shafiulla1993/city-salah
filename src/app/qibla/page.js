// src/app/qibla/page.js

import QiblaClient from "./QiblaClient";

export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function QiblaPage() {
  return <QiblaClient />;
}
