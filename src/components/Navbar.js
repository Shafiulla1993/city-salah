// src/components/Navbar.js

// src/components/Navbar.js
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const pathname = usePathname();
  const { loggedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect dynamic masjid page: /city/area/masjid/slug
  const isMasjidDetail =
    pathname.split("/").length === 5 && pathname.includes("/masjid/");

  const masjidLabel = isMasjidDetail ? "Find Masjid" : "Nearest Masjid";
  const masjidHref = isMasjidDetail ? "/masjid" : "/nearest-masjid";

  const isActive = (href) => {
    if (href === "/nearest-masjid") return pathname.includes("/masjid");
    if (href === "/qibla") return pathname.includes("/qibla");
    if (href === "/auqatus-salah") return pathname.includes("/auqatus-salah");
    if (href === "/ramzan-timetable") return pathname.includes("/ramzan");
    if (href === "/updates") return pathname.includes("/updates");
    return pathname === href;
  };

  const NavItem = ({ href, label }) => {
    const active = isActive(href);

    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`relative px-3 py-2 font-heading font-bold text-[15px]
          ${active ? "text-white" : "text-white hover:text-white"}`}
      >
        {label}

        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute inset-x-2 -bottom-1 h-[3px] bg-emerald-300 rounded"
          />
        )}
      </Link>
    );
  };

  const AuthButton = () =>
    loggedIn ? (
      <Link
        href="/auth/logout"
        className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-bold"
      >
        Logout
      </Link>
    ) : (
      <Link
        href="/auth/login"
        className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-bold"
      >
        Login
      </Link>
    );

  return (
    <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Design-logo-White.png"
              alt="CitySalah"
              width={160}
              height={44}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* MOBILE RIGHT: Ramzan + Auth + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <NavItem href="/ramzan-timetable" label="Ramzan" />
            <AuthButton />

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-white ml-1"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem href={masjidHref} label={masjidLabel} />
            <NavItem href="/qibla" label="Qibla" />
            <NavItem href="/auqatus-salah" label="Auqatus Salah" />
            <NavItem href="/ramzan-timetable" label="Ramzan Timetable" />
            <NavItem href="/updates" label="Updates" />
            <AuthButton />
          </nav>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-black/40 backdrop-blur-lg border-t border-white/20"
          >
            <nav className="flex flex-col p-4 gap-3">
              <NavItem href={masjidHref} label={masjidLabel} />
              <NavItem href="/qibla" label="Qibla" />
              <NavItem href="/auqatus-salah" label="Auqatus Salah" />
              <NavItem href="/updates" label="Updates" />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
