// src/lib/qibla/getQiblaBearing.js

export function getQiblaBearing(lat, lng) {
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);

  let θ = Math.atan2(y, x);
  θ = (θ * 180) / Math.PI;

  return (θ + 360) % 360;
}
