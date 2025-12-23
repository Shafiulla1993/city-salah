// src/components/Navbar.js

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const { loggedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  /* ---------------- Animated Nav Item ---------------- */
  function AnimatedNavItem({ href, label, active, onClick }) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`relative px-3 py-2 transition-colors ${
          active ? "text-white" : "text-white/90 hover:text-white"
        }`}
      >
        <span className="relative z-10">{label}</span>

        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute inset-x-1 -bottom-1 h-[2px] bg-emerald-300 rounded"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  }

  /* ---------------- Hide on scroll ---------------- */
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 70) setHidden(true);
      else setHidden(false);
      setLastScroll(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScroll]);

  /* ---------------- Dashboard routing ---------------- */
  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "super_admin") router.push("/dashboard/super-admin");
    else if (user.role === "masjid_admin")
      router.push("/dashboard/masjid-admin");
    else router.push("/");
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-transform duration-500 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } bg-white/15 backdrop-blur-lg border-b border-white/20`}
    >
      <div className="max-w-screen-xl mx-auto px-4 font-bold text-heading">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <button onClick={() => router.push("/")}>
            <Image
              src="/Design-logo-White.png"
              alt="CitySalah"
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </button>

          {/* MOBILE TOP LINKS + HAMBURGER */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              href="/updates"
              className={`text-sm text-white/90 hover:text-white ${
                pathname === "/updates"
                  ? "underline font-semibold text-white"
                  : ""
              }`}
            >
              Updates
            </Link>

            <Link
              href="/auqatus-salah"
              className={`text-sm whitespace-nowrap text-white/90 hover:text-white ${
                pathname === "/auqatus-salah"
                  ? "underline font-semibold text-white"
                  : ""
              }`}
            >
              Auqatus Salah
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-white drop-shadow-sm"
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center space-x-4">
            <AnimatedNavItem
              href="/updates"
              label="Updates"
              active={pathname === "/updates"}
            />

            <AnimatedNavItem
              href="/auqatus-salah"
              label="Auqatus Salah"
              active={pathname === "/auqatus-salah"}
            />

            <AnimatedNavItem
              href="/contact"
              label="Contact"
              active={pathname === "/contact"}
            />

            {loggedIn && (
              <button
                onClick={goToDashboard}
                className="px-3 py-2 text-white/90 hover:text-white transition-colors"
              >
                Dashboard
              </button>
            )}

            {loggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="px-3 py-2 text-white/90 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/logout"
                  className="px-3 py-2 text-red-300 hover:text-red-400"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 text-white/90 hover:text-white transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/20 backdrop-blur-lg border-t border-white/20 shadow-lg"
          >
            <nav className="flex flex-col p-4 space-y-3">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded text-white hover:bg-white/20 transition"
              >
                Contact
              </Link>

              <div className="border-t border-white/20 my-2" />

              {loggedIn ? (
                <>
                  <button
                    onClick={() => {
                      goToDashboard();
                      setMobileOpen(false);
                    }}
                    className="text-left px-3 py-2 rounded text-white hover:bg-white/20 transition"
                  >
                    Dashboard
                  </button>

                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded text-white hover:bg-white/20 transition"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/logout"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded text-red-300 hover:bg-red-500/20 transition"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded text-white hover:bg-white/20 transition"
                >
                  Login
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
