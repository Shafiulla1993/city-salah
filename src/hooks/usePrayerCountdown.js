// src/hooks/usePrayerCountdown.js
import { useEffect, useState } from "react";

function parseTimeString(str) {
  if (!str) return null;

  const now = new Date();
  const [h, m] = str.split(":").map(Number);

  if (isNaN(h) || isNaN(m)) return null;

  const d = new Date();
  d.setHours(h, m, 0, 0);

  // If the time already passed → next day
  if (d < now) d.setDate(d.getDate() + 1);

  return d;
}

export function getPrevAndNextIqaamats(prayerTimings = {}) {
  if (!prayerTimings || typeof prayerTimings !== "object") {
    return { next: null, prev: null };
  }

  const order = ["fajr", "Zohar", "asr", "maghrib", "isha"];

  const now = new Date();

  const list = order
    .map((p) => {
      const iq = prayerTimings[p]?.iqaamat;
      const dt = parseTimeString(iq);
      return dt ? { name: p, time: dt, timeStr: iq } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

  if (!list.length) return { next: null, prev: null };

  let next = list.find((t) => t.time > now) || null;
  let prev = null;

  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].time <= now) {
      prev = list[i];
      break;
    }
  }

  // If no upcoming today → tomorrow fajr
  if (!next) {
    const fajr = prayerTimings.fajr?.iqaamat || null;
    const dt = parseTimeString(fajr);
    if (dt) next = { name: "fajr", time: dt, timeStr: fajr };
  }

  return { next, prev };
}

export default function usePrayerCountdown(nextTime, prevTime) {
  const [state, setState] = useState({
    remainingStr: "--:--:--",
    progress: 0,
    remainingMs: 0,
  });

  useEffect(() => {
    if (!nextTime) {
      setState({
        remainingStr: "--:--:--",
        progress: 0,
        remainingMs: 0,
      });
      return;
    }

    const next = new Date(nextTime);
    const prev = prevTime ? new Date(prevTime) : null;

    function update() {
      const now = new Date();
      const remainingMs = Math.max(0, next - now);

      // Progress %
      let window = remainingMs;
      if (prev && prev < next) window = next - prev;

      let passed = window - remainingMs;
      if (passed < 0) passed = 0;

      const progress = Math.min(1, passed / (window || 1));

      // Format HH:MM:SS
      const h = String(Math.floor(remainingMs / 3600000)).padStart(2, "0");
      const m = String(Math.floor((remainingMs % 3600000) / 60000)).padStart(
        2,
        "0"
      );
      const s = String(Math.floor((remainingMs % 60000) / 1000)).padStart(
        2,
        "0"
      );

      setState({
        remainingStr: `${h}:${m}:${s}`,
        progress,
        remainingMs,
      });
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextTime, prevTime]);

  return state;
}
