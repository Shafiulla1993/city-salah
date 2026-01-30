// src/lib/hijri/getHijriOffset.js

import HijriSetting from "@/models/HijriSetting";

export async function getHijriOffset({ cityId, areaId }) {
  // 1) area override (optional)
  if (areaId) {
    const areaSetting = await HijriSetting.findOne({
      scope: "area",
      area: areaId,
    });
    if (areaSetting) return areaSetting.hijriOffset;
  }

  // 2) city override
  if (cityId) {
    const citySetting = await HijriSetting.findOne({
      scope: "city",
      city: cityId,
    });
    if (citySetting) return citySetting.hijriOffset;
  }

  // 3) global fallback
  const globalSetting = await HijriSetting.findOne({ scope: "global" });
  return globalSetting?.hijriOffset ?? 0;
}
