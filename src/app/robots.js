// src/app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",

        // 🚫 Block non-SEO routes
        disallow: [
          "/api/",
          "/dashboard/",
          "/auth/",
          "/undefined/",

          // 🚫 Resolver / GPS entry pages
          "/qibla",
          "/qibla/your-location",
          "/auqatus-salah",
          "/ramzan-timetable",
        ],
      },
    ],

    sitemap: "https://citysalah.in/sitemap.xml",
  };
}
