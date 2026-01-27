// src/app/components/main-page/FeatureGrid.js

import Link from "next/link";
import FeatureCard from "./FeatureCard";

const features = [
  {
    title: "Nearest Masjid",
    description: "Find masjids near your location.",
    href: "/nearest-masjid",
    icon: "/icons/locate-masjid.svg",
  },
  {
    title: "Search Masjid",
    description: "Search any masjid in your city.",
    href: "/masjid",
    icon: "/icons/search-masjid.svg",
  },
  {
    title: "Qibla Finder",
    description: "Find Qibla direction accurately.",
    href: "/qibla",
    icon: "/icons/qibla-finder.svg",
  },
  {
    title: "Auqatus Salah",
    description: "View daily prayer time slots.",
    href: "/auqatus-salah",
    icon: "/icons/salah-timings.svg",
  },
  {
    title: "Ramzan Timetable",
    description: "Sehri & Iftar times for your masjid.",
    href: "/ramzan-timetable",
    icon: "/icons/ramadan-icon.svg",
  },
  {
    title: "Updates",
    description: "Masjid announcements & news.",
    href: "/updates",
    icon: "/icons/announcements.svg",
  },
  {
    title: "Dashboard",
    description: "Your saved masjids & shortcuts.",
    href: "/dashboard",
    icon: "/icons/dashboard.svg",
  },
];

export default function FeatureGrid() {
  return (
    <section className="px-2 py-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <Link key={f.title} href={f.href}>
            <FeatureCard {...f} />
          </Link>
        ))}
      </div>
    </section>
  );
}
