// src/app/auqatus-salah/page.js
import AuqatusResolverClient from "./AuqatusResolverClient";

export const metadata = {
  description:
    "Redirecting to prayer time windows for your city. Auqatus Salah timings.",
  keywords: ["prayer time windows", "auqatus salah", "namaz time start end"],
  robots: "noindex, follow",
};

export default function Page() {
  return <AuqatusResolverClient />;
}
