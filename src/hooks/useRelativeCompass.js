// src/hooks/useRelativeCompass.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useRelativeCompass() {
  const [heading, setHeading] = useState(null);
  const last = useRef(null);
  const lastEmit = useRef(0);

  useEffect(() => {
    function handle(e) {
      let raw = null;

      // iOS Safari
      if (typeof e.webkitCompassHeading === "number") {
        raw = e.webkitCompassHeading;
      }
      // Android Chrome
      else if (typeof e.alpha === "number") {
        raw = e.alpha;
      }

      if (raw === null) return;

      raw = (raw + 360) % 360;

      // throttle (10fps)
      const now = Date.now();
      if (now - lastEmit.current < 100) return;
      lastEmit.current = now;

      if (last.current === null) {
        last.current = raw;
      } else {
        const diff = ((raw - last.current + 540) % 360) - 180;

        // ignore micro jitter
        if (Math.abs(diff) < 1.5) return;

        last.current = (last.current + diff * 0.2 + 360) % 360;
      }

      setHeading(last.current);
    }

    window.addEventListener("deviceorientation", handle, true);

    return () => {
      window.removeEventListener("deviceorientation", handle);
    };
  }, []);

  return heading;
}
