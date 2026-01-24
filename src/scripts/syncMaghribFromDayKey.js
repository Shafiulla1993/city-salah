import connectDB from "@/lib/db.js";
import MasjidPrayerConfig from "../models/MasjidPrayerConfig.js";
import GeneralPrayerTiming from "../models/GeneralPrayerTiming.js";
import { minutesToHHMM } from "../lib/prayer/timeHelpers.js";

function getTodayDayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

async function run() {
  await connectDB();
  const dayKey = getTodayDayKey();

  console.log("🔁 Syncing Maghrib for DayKey:", dayKey);

  const configs = await MasjidPrayerConfig.find({}).populate("masjid");

  for (const config of configs) {
    const masjid = config.masjid;
    if (!masjid) continue;

    let general = await GeneralPrayerTiming.findOne({
      city: masjid.city,
      area: masjid.area || null,
      dayKey,
    });

    if (!general) {
      general = await GeneralPrayerTiming.findOne({
        city: masjid.city,
        area: null,
        dayKey,
      });
    }

    if (!general) {
      console.log("⚠️ No general timing for:", masjid.name);
      continue;
    }

    const maghribSlot = general.slots.find((s) => s.name === "maghrib_start");
    if (!maghribSlot) continue;

    const base = maghribSlot.time;
    const azanOffset = config.maghribOffset?.azan || 0;
    const iqaamatOffset = config.maghribOffset?.iqaamat || 3;

    const azan = minutesToHHMM(base + azanOffset);
    const iqaamat = minutesToHHMM(base + iqaamatOffset);

    config.lastComputed = {
      ...config.lastComputed,
      maghrib: {
        azan,
        iqaamat,
        source: "auqatus_salah",
        syncedAt: new Date(),
      },
    };

    await config.save();

    console.log(`✅ Synced ${masjid.name}: ${azan} / ${iqaamat}`);
  }

  console.log("🎉 Maghrib sync completed for all masjids.");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Sync failed:", e);
  process.exit(1);
});
