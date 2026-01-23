// src/app/api/super-admin/general-prayer-timings/import-csv/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import connectDB from "@/lib/db";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import { normalizeTime } from "@/lib/helpers/normalizeTime";

function toDayKey(raw) {
  if (!raw) return null;

  const val = raw.trim(); // "1-Jan"
  const [d, m] = val.split("-");

  const day = d.padStart(2, "0");
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  if (!months[m]) return null;
  return `${months[m]}-${day}`;
}

function parseCSV(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.trim().split(/\r?\n/);

  // detect delimiter: tab or comma
  const delimiter = lines[0].includes("\t") ? "\t" : ",";

  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const cols = line.split(delimiter);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i]?.trim();
    });
    return row;
  });
}

export const POST = withAuth("super_admin", async (req, user) => {
  await connectDB();

  const { city, area, csvText } = await req.json();

  if (!city || !csvText) {
    return Response.json(
      { success: false, message: "city and csvText required" },
      { status: 400 },
    );
  }

  const rows = parseCSV(csvText);

  const ops = rows.map((r) => {
    const dayKey = toDayKey(r.date);
    if (!dayKey) throw new Error("Invalid date in CSV: " + r.date);

    const slots = Object.entries(r)
      .filter(([k]) => k !== "date")
      .map(([name, time]) => ({
        name,
        time: normalizeTime(time, name),
      }));

    return {
      updateOne: {
        filter: { city, area: area || null, dayKey },
        update: {
          city,
          area: area || null,
          dayKey,
          slots,
          updatedAt: new Date(),
          updatedBy: user?._id,
        },
        upsert: true,
      },
    };
  });

  await GeneralPrayerTiming.bulkWrite(ops);

  return Response.json({
    success: true,
    message: "CSV imported successfully",
    total: rows.length,
  });
});
