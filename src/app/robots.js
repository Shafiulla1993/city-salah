// src/app/robots.js

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/", "/_next/image", "/favicon.png", "/images/"],
        disallow: ["/api/", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: "https://citysalah.in/sitemap.xml",
  };
}
