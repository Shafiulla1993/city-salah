// src/hooks/useCompass.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompass() {
  const [heading, setHeading] = useState(null);
  const [unstable, setUnstable] = useState(false);

  const lastHeading = useRef(null);
  const lastUpdate = useRef(Date.now());
  const stableSince = useRef(null);

  useEffect(() => {
    function handleOrientation(e) {
      if (typeof e.alpha !== "number") return;

      const now = Date.now();
      const raw = e.alpha;

      // Smooth heading
      if (lastHeading.current === null) {
        lastHeading.current = raw;
      } else {
        lastHeading.current =
          lastHeading.current * 0.85 + raw * 0.15;
      }

      const diff = Math.abs(raw - lastHeading.current);

      // Detect instability
      if (diff > 20) {
        setUnstable(true);
        stableSince.current = null;
      } else {
        // Stable reading
        if (!stableSince.current) {
          stableSince.current = now;
        }

        // Stable for 1.5s → stop calibration
        if (now - stableSince.current > 1500) {
          setUnstable(false);
        }
      }

      lastUpdate.current = now;
      setHeading(lastHeading.current);
    }

    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true
    );
    window.addEventListener(
      "deviceorientation",
      handleOrientation,
      true
    );

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation
      );
      window.removeEventListener(
        "deviceorientation",
        handleOrientation
      );
    };
  }, []);

  return { heading, unstable };
}
