// src/components/ui/HomeButton.js

"use client";

import { useRouter, usePathname } from "next/navigation";
import { FiHome } from "react-icons/fi";

export default function HomeButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <button
      onClick={() => router.push("/")}
      aria-label="Go to Home"
      className="
        fixed
        bottom-[calc(env(safe-area-inset-bottom)+1.25rem)]
        right-4
        z-[9999]
        bg-white/90 backdrop-blur-lg
        p-3 rounded-full
        shadow-xl
        text-sky-700
        hover:text-sky-900
        active:scale-95
        transition
      "
    >
      <FiHome size={22} />
    </button>
  );
}
