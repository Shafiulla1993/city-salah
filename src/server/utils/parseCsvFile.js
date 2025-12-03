// src/lib/utils/parseCsvFile.js

import fs from "fs";
import path from "path";

/**
 * Parses a CSV file into an array of objects.
 * First row = header / field names
 * Each next row = row values matched to headers
 *
 * Example CSV:
 * date,seheri_end,fajr_start,fajr_end
 * 2025-01-01,5:21 AM,5:30 AM,6:10 AM
 *
 * → returns:
 * [
 *   {
 *     date: "2025-01-01",
 *     seheri_end: "5:21 AM",
 *     fajr_start: "5:30 AM",
 *     fajr_end: "6:10 AM"
 *   }
 * ]
 */
export async function parseCsvFile(filepath) {
  return new Promise((resolve, reject) => {
    try {
      const fullPath = path.resolve(filepath);
      const raw = fs.readFileSync(fullPath, "utf8");

      // Split lines, remove empty lines
      const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) return resolve([]);

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/\uFEFF/g, "")); // remove BOM

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = cols[idx] ?? "";
        });
        rows.push(obj);
      }

      resolve(rows);
    } catch (err) {
      console.error("parseCsvFile error:", err);
      reject(err);
    }
  });
}
