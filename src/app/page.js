// src/app/page.js

import Hero from "@/components/main-page/Hero";
import FeatureGrid from "@/components/main-page/FeatureGrid";
import AddMasjid from "@/components/main-page/AddMasjid";

export default function HomePage() {
  return (
    <>
      {/* HERO SECTION */}
      <Hero />

      {/* FEATURES */}
      <section className="mt-3">
        <FeatureGrid />
      </section>

      {/* ADD MASJID CTA */}
      <section className="mt-2">
        <AddMasjid />
      </section>
    </>
  );
}
