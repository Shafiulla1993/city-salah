// src/app/ramzan-timetable/page.js

export const metadata = {
  robots: "noindex, nofollow",
};

import RamzanResolverClient from "./RamzanResolverClient";

export default function Page() {
  return <RamzanResolverClient />;
}
