// src/app/ramzan-timetable/page.js

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMasjidStore } from "@/store/useMasjidStore";

export default function RamzanResolver() {
  const router = useRouter();
  const { init, initializing, selectedCitySlug, selectedAreaSlug } =
    useMasjidStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initializing) return;

    if (selectedCitySlug && selectedAreaSlug) {
      router.replace(
        `/${selectedCitySlug}/${selectedAreaSlug}/ramzan-timetable`,
      );
      return;
    }

    router.replace(`/mysore/rajiv-nagar/ramzan-timetable`);
  }, [initializing, selectedCitySlug, selectedAreaSlug, router]);

  return null;
}
