// src/hooks/useCompassHeading.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompassHeading() {
  const [heading, setHeading] = useState(null);
  const last = useRef(null);

  useEffect(() => {
    function handleOrientation(e) {
      let h = null;

      // iOS Safari
      if (typeof e.webkitCompassHeading === "number") {
        h = e.webkitCompassHeading; // already true north
      }
      // Android / others
      else if (typeof e.alpha === "number") {
        h = 360 - e.alpha;
      }

      if (h === null) return;

      // normalize
      h = (h + 360) % 360;

      // smooth (low-pass filter)
      if (last.current === null) {
        last.current = h;
      } else {
        last.current = last.current * 0.85 + h * 0.15;
      }

      setHeading(last.current);
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

  return heading;
}
