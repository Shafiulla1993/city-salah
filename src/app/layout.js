import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

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
        <meta property="og:url" content="https://yourdomain.com" />
        <link rel="icon" href="/favicon.ico" />
        <title>{metadata.title}</title>
      </head>

      <body className="bg-gradient-to-r from-slate-300 to-slate-500 pt-12">
        <AuthProvider>
          {/* Navbar */}
          <Navbar />

          {/* Main content */}
          <main className="max-w-7xl mx-auto p-6 md:p-10 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
