// src/app/layout.js
import "./globals.css";

import Image from "next/image";
import dynamic from "next/dynamic";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/main-page/Footer";
import ToastProviderClient from "@/components/ui/ToastProviderClient";
import HomeButtonClientOnly from "@/components/ui/HomeButtonClientOnly";

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <meta name="description" content={metadata.description} />
        <meta
          name="keywords"
          content="CitySalah, prayer timings, masjid near me, mosque timings, namaz time, Islamic prayer times, Mysuru masjids"
        />

        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://citysalah.in" />

        <link rel="canonical" href="https://citysalah.in" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        <meta name="theme-color" content="#0F2A44" />
        <title>{metadata.title}</title>
      </head>

      {/* BODY */}
      <body className="relative overflow-x-hidden flex flex-col min-h-[100dvh]">
        {/* 🌌 GLOBAL STATIC BACKGROUND */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -10,
            width: "100vw",
            height: "100dvh",
            backgroundColor: "#0F2A44",
          }}
        >
          <Image
            src="/backgrounds/hero-bg.webp"
            alt="CitySalah background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* ✅ DARK OVERLAY (does NOT affect text colors) */}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <AuthProvider>
          {/* NAVBAR */}
          <Navbar />

          {/* TOASTS */}
          <ToastProviderClient />

          {/* MAIN CONTENT */}
          <main className="flex-1 flex flex-col">{children}</main>

          <Footer />
          {/* FLOATING HOME BUTTON (MOBILE FIRST) */}
          <HomeButtonClientOnly />

          {/* ANALYTICS */}
          <SpeedInsights />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
