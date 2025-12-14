// src/app/layout.js
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ToastProviderClient from "@/components/ui/ToastProviderClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "CitySalah — Prayer Timings, Masjids & Announcements",
  description:
    "CitySalah is your go-to platform for locating masjids, knowing accurate prayer timings, and staying updated with community announcements.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta
          name="keywords"
          content="CitySalah, city salah, prayer timings, masjid timings, mosque timings, namaz time, Islamic prayer times, prayer near me, masjid near me, Mysuru masjids"
        />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://citysalah.in" />
        <link rel="canonical" href="https://citysalah.in" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="250x250" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="theme-color" content="#1D4ED8" />
        <title>{metadata.title}</title>
      </head>

      {/* Use full width with padding; center content but allow wide screens */}
      <body>
        <AuthProvider>
          <Navbar />
          <ToastProviderClient />

          {/* change: use w-full and horizontal padding, limit to a larger max if you want */}
          <main>
            <div>{children}</div>

            <SpeedInsights />
            <Analytics />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
