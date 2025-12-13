// src/app/updates/page.js
import UpdatesClient from "./UpdatesClient";

export const metadata = {
  title: "Community Updates & Announcements | CitySalah",
  description:
    "Stay updated with the latest masjid announcements, community notices, and daily Islamic reminders on CitySalah.",
  alternates: {
    canonical: "https://citysalah.in/updates",
  },
  openGraph: {
    title: "Community Updates | CitySalah",
    description:
      "Latest masjid announcements, general notices, and thought of the day.",
    url: "https://citysalah.in/updates",
    siteName: "CitySalah",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Community Updates | CitySalah",
    description:
      "Masjid announcements, community updates, and daily Islamic reminders.",
  },
};

export default function UpdatesPage() {
  return <UpdatesClient />;
}
