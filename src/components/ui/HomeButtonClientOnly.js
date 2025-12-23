// src/components/ui/HomeButtonClientOnly.js

"use client";

import { useEffect, useState } from "react";
import HomeButton from "./HomeButton";

export default function HomeButtonClientOnly() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <HomeButton />;
}
