// src/app/robots.js

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/", "/_next/image"],
        disallow: ["/api/", "/dashboard/", "/login/"],
      },
    ],
    sitemap: "https://citysalah.in/sitemap.xml",
  };
}
