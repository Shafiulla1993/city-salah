// src/hooks/usePrayerCountdown.js
import { useEffect, useState } from "react";

function parseTimeString(str) {
  if (!str || typeof str !== "string") return null;

  const now = new Date();

  let hours, minutes;

  // Handle 12-hour format with AM/PM
  if (str.toUpperCase().includes("AM") || str.toUpperCase().includes("PM")) {
    const [time, modifier] = str.trim().split(" ");
    if (!time || !modifier) return null;

    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;

    hours = h % 12;
    if (modifier.toUpperCase() === "PM") hours += 12;
    minutes = m;
  } else {
    // Handle 24-hour format
    const [h, m] = str.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    hours = h;
    minutes = m;
  }

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);

  // If time already passed → next day
  if (d < now) d.setDate(d.getDate() + 1);

  return d;
}

export function getPrevAndNextIqaamats(prayerTimings = {}) {
  const order = ["fajr", "zohar", "asr", "maghrib", "isha"];

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  function toClockMinutes(str) {
    if (!str) return null;

    // parse WITHOUT date rollover
    const [time, meridian] = str.trim().split(" ");
    let [h, m] = time.split(":").map(Number);

    if (meridian === "PM" && h !== 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;

    return h * 60 + m;
  }

  const list = order
    .map((name) => {
      const iq = prayerTimings[name]?.iqaamat;
      const mins = toClockMinutes(iq);
      return mins !== null ? { name, mins, timeStr: iq } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.mins - b.mins);

  if (!list.length) return { next: null, prev: null };

  // NEXT prayer (cyclic)
  let next = list.find((p) => p.mins > nowMin);
  if (!next) next = list[0]; // tomorrow Fajr

  // PREVIOUS prayer
  let prev =
    [...list].reverse().find((p) => p.mins <= nowMin) || list[list.length - 1];

  // Convert to Date ONLY for countdown
  const nextDate = parseTimeString(next.timeStr);
  const prevDate = parseTimeString(prev.timeStr);

  return {
    next: { ...next, time: nextDate },
    prev: { ...prev, time: prevDate },
  };
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

      let rawProgress = Math.min(1, passed / (window || 1));

      // 🔑 Visual acceleration near end
      let visualProgress =
        rawProgress < 0.7
          ? rawProgress * 0.7
          : 0.7 + ((rawProgress - 0.7) * 1.0) / 0.3;

      visualProgress = Math.min(1, visualProgress);

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
        progress: visualProgress,
        remainingMs,
      });
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextTime, prevTime]);

  return state;
}
