// src/app/ramzan-timetable/page.js
import RamzanResolverClient from "./RamzanResolverClient";

export const metadata = {
  description: "Redirecting to Ramzan Sehri and Iftar timetable for your area.",
  keywords: [
    "ramzan timetable",
    "sehri iftar time",
    "sehri time",
    "iftar time",
    "ramadan fasting time",
  ],
  robots: "noindex, follow",
};

export default function Page() {
  return <RamzanResolverClient />;
}
