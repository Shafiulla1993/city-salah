// MasjidSearchClientWrapper.js

"use client";

import dynamic from "next/dynamic";

// ✅ ssr:false is ALLOWED here
const MasjidSearchClient = dynamic(() => import("./MasjidSearchClient"), {
  ssr: false,
});

export default function MasjidSearchClientWrapper() {
  return <MasjidSearchClient />;
}
