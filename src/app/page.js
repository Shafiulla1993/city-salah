// src/app/page.js

import Hero from "@/components/main-page/Hero";
import FeatureGrid from "@/components/main-page/FeatureGrid";
import AddMasjid from "@/components/main-page/AddMasjid";

export const metadata = {
  title: "CitySalah – Prayer Timings, Masjid Finder, Qibla & Ramzan Timetable",
  description:
    "CitySalah helps you find the nearest masjid, view accurate Auqatus Salah, check Qibla direction, follow Ramzan Sehri & Iftar timetable, and get local masjid announcements in Mysore and nearby cities.",

  keywords: [
    "CitySalah",
    "Masjid near me",
    "Nearest mosque",
    "Prayer timings Mysore",
    "Auqatus Salah",
    "Qibla direction",
    "Ramzan timetable",
    "Sehri Iftar time",
    "Islamic prayer times India",
    "Mosque finder",
    "Masjid announcements",
  ],
};

export default function HomePage() {
  return (
    <>
      {/* HERO SECTION */}
      <Hero />

      {/* FEATURES GRID */}
      <section className="mt-4" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          CitySalah Features
        </h2>
        <FeatureGrid />
      </section>

      {/* ADD MASJID CTA */}
      <section className="mt-3" aria-labelledby="add-masjid-heading">
        <h2 id="add-masjid-heading" className="sr-only">
          Add Your Masjid
        </h2>
        <AddMasjid />
      </section>
    </>
  );
}
