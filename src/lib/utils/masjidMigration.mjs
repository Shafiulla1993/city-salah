// masjidMigration.mjs
import fs from "fs";
import mongoose from "mongoose";
import Masjid from "../models/Masjid.js"; // relative path, keep .js

const MONGO_URI = "your-mongo-uri";

const rawData = fs.readFileSync(
  new URL("./oldMasjids.json", import.meta.url),
  "utf-8"
);
const oldMasjids = JSON.parse(rawData);

async function migrate() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const batchSize = 50;
  for (let i = 0; i < oldMasjids.length; i += batchSize) {
    const batch = oldMasjids.slice(i, i + batchSize);

    const newMasjids = batch.map((m) => ({
      name: m.name || "",
      slug: m.slug || "",
      address: m.address || "",
      city: m.city,
      area: m.area,
      location: m.location || { type: "Point", coordinates: [0, 0] },
      imageUrl: m.imageUrl || "",
      contacts: m.contacts || [],
      prayerTimings: m.prayerTimings || [],
      timezone: m.timezone || "Asia/Kolkata",
      description: m.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    for (const masjid of newMasjids) {
      await Masjid.updateOne(
        { slug: masjid.slug, area: masjid.area },
        { $setOnInsert: masjid },
        { upsert: true }
      );
    }

    console.log(`Migrated batch ${i}-${i + batch.length}`);
  }

  console.log("Migration complete!");
  await mongoose.disconnect();
}

migrate();
