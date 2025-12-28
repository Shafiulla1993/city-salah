// src/hooks/useCompassHeading.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompassHeading() {
  const [heading, setHeading] = useState(null);

  const last = useRef(null);
  const lastEmit = useRef(0);

  useEffect(() => {
    function onOrientation(e) {
      let raw = null;

      // iOS
      if (typeof e.webkitCompassHeading === "number") {
        raw = e.webkitCompassHeading;
      }
      // Android
      else if (typeof e.alpha === "number") {
        raw = e.alpha;
      }

      if (raw === null) return;

      // Normalize
      raw = (raw + 360) % 360;

      // Throttle (max ~10 updates/sec)
      const now = Date.now();
      if (now - lastEmit.current < 100) return;
      lastEmit.current = now;

      // Strong smoothing
      if (last.current === null) {
        last.current = raw;
      } else {
        const diff =
          ((raw - last.current + 540) % 360) - 180;

        // Ignore tiny jitters
        if (Math.abs(diff) < 1.5) return;

        last.current =
          (last.current + diff * 0.2 + 360) % 360;
      }

      setHeading(last.current);
    }

    window.addEventListener("deviceorientation", onOrientation, true);

    return () => {
      window.removeEventListener(
        "deviceorientation",
        onOrientation
      );
    };
  }, []);

  return heading;
}
