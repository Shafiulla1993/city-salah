// src/components/Navbar.js
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { loggedIn } = useAuth();
  const [open, setOpen] = useState(false);

  const isMasjidDetail =
    pathname.split("/").length === 5 && pathname.includes("/masjid/");

  const masjidLabel = isMasjidDetail ? "Find Masjid" : "Nearest Masjid";
  const masjidHref = isMasjidDetail ? "/masjid" : "/nearest-masjid";

  const isActive = (href) => pathname.includes(href);

  const NavItem = ({ href, label }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`block px-3 py-2 font-bold text-white ${
        isActive(href) ? "border-b-2 border-emerald-400" : ""
      }`}
    >
      {label}
    </Link>
  );

  const AuthButton = () =>
    loggedIn ? (
      <Link
        href="/auth/logout"
        className="bg-red-600 text-white px-3 py-1.5 rounded font-bold"
      >
        Logout
      </Link>
    ) : (
      <Link
        href="/auth/login"
        className="bg-emerald-600 text-white px-3 py-1.5 rounded font-bold"
      >
        Login
      </Link>
    );

  return (
    <header className="sticky top-0 z-50 bg-[#0F2A44]/95 backdrop-blur border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Design-logo-White.png"
            alt="CitySalah"
            width={140}
            height={36}
            priority
          />
        </Link>

        {/* MOBILE RIGHT: Ramzan + Auth + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/ramzan-timetable" className="font-bold text-white">
            Ramzan
          </Link>

          <AuthButton />

          <button onClick={() => setOpen(!open)} className="text-white">
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-2">
          <NavItem href={masjidHref} label={masjidLabel} />
          <NavItem href="/qibla" label="Qibla" />
          <NavItem href="/auqatus-salah" label="Auqatus Salah" />
          <NavItem href="/ramzan-timetable" label="Ramzan Timetable" />
          <NavItem href="/updates" label="Updates" />
          <NavItem href="/dashboard" label="Dashboard" />
          <AuthButton />
        </nav>
      </div>

      {/* MOBILE DRAWER (Dashboard inside here) */}
      {open && (
        <div className="md:hidden bg-[#0F2A44] border-t border-white/20">
          <nav className="flex flex-col p-4 gap-1">
            <NavItem href={masjidHref} label={masjidLabel} />
            <NavItem href="/qibla" label="Qibla" />
            <NavItem href="/auqatus-salah" label="Auqatus Salah" />
            <NavItem href="/ramzan-timetable" label="Ramzan Timetable" />
            <NavItem href="/updates" label="Updates" />
            <NavItem href="/dashboard" label="Dashboard" />
          </nav>
        </div>
      )}
    </header>
  );
}
