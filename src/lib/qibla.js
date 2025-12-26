export const KAABA = { lat: 21.422487, lng: 39.826206 };

const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

export function getQiblaBearing(lat, lng) {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);

  const x = Math.sin(Δλ);
  const y = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);

  return (toDeg(Math.atan2(x, y)) + 360) % 360;
}
