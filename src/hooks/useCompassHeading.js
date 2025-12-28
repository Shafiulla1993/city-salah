// src/hooks/useCompassHeading

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompassHeading() {
  const [heading, setHeading] = useState(null);
  const last = useRef(null);
  const lastEmit = useRef(0);

  useEffect(() => {
    async function init() {
      // iOS permission
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res !== "granted") return;
        } catch {
          return;
        }
      }

      window.addEventListener("deviceorientationabsolute", handle, true);
      window.addEventListener("deviceorientation", handle, true);
    }

    function handle(e) {
      if (e.absolute === false) return;

      let raw = null;

      // iOS
      if (typeof e.webkitCompassHeading === "number") {
        raw = e.webkitCompassHeading;
      }
      // Android
      else if (typeof e.alpha === "number") {
        raw = 360 - e.alpha;
      }

      if (raw === null) return;

      // Screen orientation correction
      const screenAngle =
        window.screen.orientation?.angle || window.orientation || 0;

      raw = (raw + screenAngle + 360) % 360;

      // Throttle
      const now = Date.now();
      if (now - lastEmit.current < 120) return;
      lastEmit.current = now;

      // Strong smoothing
      if (last.current === null) {
        last.current = raw;
      } else {
        const diff = ((raw - last.current + 540) % 360) - 180;

        if (Math.abs(diff) < 2) return;

        last.current = (last.current + diff * 0.25 + 360) % 360;
      }

      setHeading(last.current);
    }

    init();

    return () => {
      window.removeEventListener("deviceorientationabsolute", handle);
      window.removeEventListener("deviceorientation", handle);
    };
  }, []);

  return heading;
}
