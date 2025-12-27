// src/hooks/useCompass.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompass() {
  const [heading, setHeading] = useState(null);
  const last = useRef(null);

  useEffect(() => {
    function handleOrientation(e) {
      if (typeof e.alpha !== "number") return;

      const alpha = e.alpha;

      // Low-pass filter (smoothing)
      if (last.current === null) {
        last.current = alpha;
      } else {
        last.current = last.current * 0.85 + alpha * 0.15;
      }

      setHeading(last.current);
    }

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return heading;
}
