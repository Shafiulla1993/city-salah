// src/hooks/useCompassHeading.js

"use client";

import { useEffect, useRef, useState } from "react";

export function useCompassHeading() {
  const [heading, setHeading] = useState(null);
  const last = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (typeof e.alpha !== "number") return;

      if (last.current === null) {
        last.current = e.alpha;
      } else {
        last.current = last.current * 0.85 + e.alpha * 0.15;
      }

      setHeading(last.current);
    }

    window.addEventListener("deviceorientationabsolute", handle, true);
    window.addEventListener("deviceorientation", handle, true);

    return () => {
      window.removeEventListener("deviceorientationabsolute", handle);
      window.removeEventListener("deviceorientation", handle);
    };
  }, []);

  return heading;
}
