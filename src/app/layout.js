// src/app/layout.js
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { MasjidProvider } from "@/context/MasjidContext";
import Navbar from "@/components/Navbar";
import ToastProviderClient from "@/components/ui/ToastProviderClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "City Salah",
  description:
    "City Salah is your ultimate guide to local mosques, prayer timings, and announcements in your city. Stay connected with the community and never miss a prayer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth-dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="theme-color" content="#1D4ED8" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://citysalah.in" />
        <link rel="icon" href="/logo.png" />
        <title>{metadata.title}</title>
      </head>

      <body className="bg-gradient-to-r from-slate-300 to-slate-500 pt-12">
        <AuthProvider>
          <MasjidProvider>
            <Navbar />

            <ToastProviderClient />
            <main className="max-w-7xl mx-auto p-6 md:p-10 min-h-screen">
              {children}
              <SpeedInsights />
              <Analytics />
            </main>
          </MasjidProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
