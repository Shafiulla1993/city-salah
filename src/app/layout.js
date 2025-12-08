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
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="description" content={metadata.description} />
        <meta
          name="keywords"
          content="CitySalah, city salah, prayer timings, masjid timings, mosque timings, namaz time, Islamic prayer times, prayer near me, masjid near me, Mysuru masjids"
        />

        {/* Social | OG Preview */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://citysalah.in" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://citysalah.in" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" sizes="250x250" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />

        <meta name="theme-color" content="#1D4ED8" />
        <title>{metadata.title}</title>

        {/* Google Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CitySalah",
              url: "https://citysalah.in",
              description: metadata.description,
              applicationCategory: "Religion",
              operatingSystem: "Web",
            }),
          }}
        />
      </head>

      <body className="bg-gradient-to-r from-slate-300 to-slate-500 pt-12">
        <AuthProvider>
          <Navbar />
          <ToastProviderClient />

          <main className="max-w-7xl mx-auto p-6 md:p-4 min-h-screen relative">
            <h1 className="m-2 text-4xl font-bold text-center text-indigo-700 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] tracking-wide animate-headingSmooth">
              CitySalah
            </h1>

            {children}

            <SpeedInsights />
            <Analytics />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
