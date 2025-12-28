// src/lib/qibla/getQiblaBearing.js

import { getGreatCircleBearing } from "geolib";

const KAABA = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export function getQiblaBearing(lat, lng) {
  return getGreatCircleBearing(
    { latitude: lat, longitude: lng },
    KAABA
  );
}
