// src/app/qibla/page.js

import { redirect } from "next/navigation";

export const metadata = {
  robots: "noindex, follow",
};

export default function QiblaRootRedirect() {
  redirect("/nearest-masjid");
}
