/**
 * Cron Job: Daily Prayer Timings Generator
 * Runs everyday at 12:30 AM IST
 * Only generates timings NOT already saved in DB.
 */

import cron from "node-cron";
import moment from "moment-timezone";
import connectDB from "@/lib/db";

import Area from "@/models/Area";
import City from "@/models/City";
import GeneralPrayerTiming from "@/models/GeneralPrayerTiming";
import { generateBothMadhabs } from "@/lib/prayer/generatePrayerTimes";

/**
 * MAIN DAILY GENERATION FUNCTION
 */
async function generateDailyTimings() {
  await connectDB();

  const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

  console.log(`\n⏳ Generating prayer timings for: ${today}\n`);

  // Load all cities and areas
  const areas = await Area.find().populate("city");

  if (!areas.length) {
    console.log("⚠ No areas found. Skipping generation.");
    return;
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const area of areas) {
    const { center, city } = area;

    if (!center?.coordinates) {
      console.log(`⚠ Missing coordinates for area: ${area.name}`);
      continue;
    }

    const coordinates = {
      latitude: center.coordinates[1],
      longitude: center.coordinates[0],
      timezone: city.timezone || "Asia/Kolkata",
    };

    // Generate timings for both madhabs
    const { shafi, hanafi } = generateBothMadhabs(coordinates);
    const timingsByMadhab = { shafi, hanafi };

    for (const [madhab, data] of Object.entries(timingsByMadhab)) {
      const exists = await GeneralPrayerTiming.findOne({
        area: area._id,
        date: today,
        madhab,
      });

      if (exists) {
        skippedCount++;
        continue;
      }

      await GeneralPrayerTiming.create({
        area: area._id,
        city: city._id,
        date: today,
        prayers: data.prayers,
        madhab,
        type: "date",
      });

      createdCount++;
    }
  }

  console.log(
    `\n🎉 Daily timings generation completed:
    ➤ Created: ${createdCount}
    ➤ Skipped: ${skippedCount}\n`
  );
}

/**
 * CRON SCHEDULER
 * Runs everyday at 12:30 AM (IST)
 *
 * Cron format: "min hour * * *"
 * India Time: Use moment-timezone conversion
 */
cron.schedule(
  "30 0 * * *",
  () => {
    console.log("⏰ Cron Triggered: Generating Daily Timings...");
    generateDailyTimings().catch((err) =>
      console.error("❌ Daily timing generation failed:", err)
    );
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

console.log("✅ Cron job scheduled for 12:30 AM IST daily.");

export { generateDailyTimings };
