// /scripts/migrateMasjidPrayerConfig.js

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../lib/db.js";
import Masjid from "./_models/Masjid.js";
import MasjidPrayerConfig from "./_models/MasjidPrayerConfig.js";

function cleanTime(v) {
  if (!v) return "";
  return v.toString().trim();
}

async function migrate() {
  await connectDB();

  const masjids = await Masjid.find({});
  console.log(`Found ${masjids.length} masjids`);

  for (const masjid of masjids) {
    const exists = await MasjidPrayerConfig.findOne({ masjid: masjid._id });
    if (exists) {
      console.log(`⏭️ Skipping ${masjid.name} (already migrated)`);
      continue;
    }

    const old = masjid.prayerTimings?.[0] || {};

    const rules = [];

    // Manual prayers
    ["fajr", "zohar", "asr", "isha", "juma"].forEach((p) => {
      rules.push({
        prayer: p,
        mode: "manual",
        manual: {
          azan: cleanTime(old?.[p]?.azan),
          iqaamat: cleanTime(old?.[p]?.iqaamat),
        },
      });
    });

    // Maghrib → AUTO
    rules.push({
      prayer: "maghrib",
      mode: "auto",
      auto: {
        source: "auqatus_salah",
        azan_offset_minutes: 2,
        iqaamat_offset_minutes: 4,
      },
      lastComputed: {
        azan: cleanTime(old?.maghrib?.azan),
        iqaamat: cleanTime(old?.maghrib?.iqaamat),
        syncedAt: old?.maghrib?.azan ? new Date() : null,
      },
    });

    await MasjidPrayerConfig.create({
      masjid: masjid._id,
      rules,
    });

    console.log(`✅ Migrated ${masjid.name}`);
  }

  console.log("🎉 Migration complete");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed", err);
  process.exit(1);
});
