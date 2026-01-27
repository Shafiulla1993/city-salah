// src/app/components/main-page/FeatureGrid.js

"use client";

import Link from "next/link";
import FeatureCard from "./FeatureCard";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    title: "Locate Nearest Masjid",
    description: "Find masjids near your location.",
    href: "/nearest-masjid",
    icon: "/icons/locate-masjid.svg",
  },
  {
    title: "Search Masjid",
    description: "Search for any masjid in your city.",
    href: "/masjid",
    icon: "/icons/search-masjid.svg",
  },
  {
    title: "Ramzan Timetable",
    description: "Sehri & Iftar timings for your nearby masjid. (Coming Soon)",
    href: "/ramzan-timetable",
    icon: "/icons/ramadan-icon.svg",
  },
  {
    title: "Qibla Finder",
    description: "Find the direction of the Qibla.",
    href: "/qibla",
    icon: "/icons/qibla-finder.svg",
  },
  {
    title: "Salah Timings",
    description: "See accurate prayer times.",
    href: "/auqatus-salah",
    icon: "/icons/salah-timings.svg",
  },
  {
    title: "Latest Updates",
    description: "Get announcements & news from local masjids.",
    href: "/updates",
    icon: "/icons/announcements.svg",
  },
  {
    title: "Community Discussion",
    description: "Join the talk with the community.",
    href: "/community",
    icon: "/icons/community.svg",
    comingSoon: true,
  },
];

export default function FeatureGrid() {
  const { loggedIn, user } = useAuth();

  const adminFeature =
    loggedIn && (user?.role === "super_admin" || user?.role === "masjid_admin")
      ? [
          {
            title: "Admin Dashboard",
            description: "Manage masjid, timings & announcements.",
            href:
              user.role === "super_admin"
                ? "/dashboard/super-admin"
                : "/dashboard/masjid-admin",
            icon: "/icons/admin.svg",
          },
        ]
      : [];

  const allFeatures = [...adminFeature, ...features];

  return (
    <section className="px-4 py-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 place-content-center">
        {allFeatures.map((feature) => (
          <Link
            key={feature.title}
            href={feature.comingSoon ? "#" : feature.href}
            aria-disabled={feature.comingSoon}
            tabIndex={feature.comingSoon ? -1 : 0}
            className={feature.comingSoon ? "pointer-events-none" : ""}
          >
            <FeatureCard {...feature} />
          </Link>
        ))}
      </div>
    </section>
  );
}
