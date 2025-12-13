// src/lib/search/searchCore.js

/**
 * Normalize text for search
 * - lowercase
 * - remove spaces & separators
 */
export function normalizeText(str = "") {
  return str
    .toString()
    .toLowerCase()
    .replace(/[\s\-_.]/g, "");
}

/**
 * Generic search engine
 *
 * @param {Array} data - array of objects
 * @param {string} query - user input
 * @param {Array<string|function>} fields - fields or resolvers
 */
export function searchItems({ data = [], query = "", fields = [] }) {
  if (!query.trim()) return [];

  const q = normalizeText(query);

  return data.filter((item) =>
    fields.some((field) => {
      const value =
        typeof field === "function"
          ? field(item)
          : item?.[field];

      if (!value) return false;

      return normalizeText(value).includes(q);
    })
  );
}
