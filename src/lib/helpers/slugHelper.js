// src/lib/helpers/slugHelper.js
// ----------------------------------------------
// Reusable helper to generate clean slugs
// Example: "Bangalore City" -> "bangalore-city"
// ----------------------------------------------

export function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")          // Convert spaces to hyphens
    .replace(/[^\w\-]+/g, "");       // Remove non-word characters
}
