// src/hooks/useCompass.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompass() {
  const [heading, setHeading] = useState(null);
  const [unstable, setUnstable] = useState(false);

  const last = useRef(null);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    function handleOrientation(e) {
      if (typeof e.alpha !== "number") return;

      const now = Date.now();
      const alpha = e.alpha;

      if (last.current !== null) {
        const diff = Math.abs(alpha - last.current);
        const timeDiff = now - lastTime.current;

        // Detect instability
        if (diff > 25 && timeDiff < 300) {
          setUnstable(true);
        } else {
          setUnstable(false);
        }

        // smoothing
        last.current = last.current * 0.85 + alpha * 0.15;
      } else {
        last.current = alpha;
      }

      lastTime.current = now;
      setHeading(last.current);
    }

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return { heading, unstable };
}
