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

  function AnimatedNavItem({ href, label, active, onClick }) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="relative px-3 py-2 text-gray-700 hover:text-gray-900"
      >
        <span className="relative z-10">{label}</span>

        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute inset-x-1 -bottom-1 h-[2px] bg-white rounded"
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

  const isActive = (path) =>
    pathname === path
      ? "text-gray-900 underline font-semibold"
      : "text-gray-700";

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-transform duration-500 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } bg-gradient-to-r from-stone-300 to-gray-400 shadow-2xl`}
    >
      <div className="max-w-screen-xl mx-auto px-4 font-bold text-heading">
        <div className="flex items-center justify-between h-16">
          {/* LOGO + BACK */}
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")}>
              <Image
                src="/Design-logo.png"
                alt="CitySalah"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </button>
          </div>

          {/* MOBILE ICON */}
          {/* MOBILE PRIMARY TABS */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              href="/updates"
              className={`text-sm ${
                pathname === "/updates" ? "underline font-semibold" : ""
              }`}
            >
              Updates
            </Link>

            <Link
              href="/auqatus-salah"
              className={`text-sm whitespace-nowrap ${
                pathname === "/auqatus-salah" ? "underline font-semibold" : ""
              }`}
            >
              Auqatus Salah
            </Link>

            {/* Hamburger for secondary items */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-gray-800"
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
                className="px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </button>
            )}

            {loggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="px-3 py-2 text-gray-700 hover:text-gray-900"
                >
                  Profile
                </Link>
                <Link
                  href="/logout"
                  className="px-3 py-2 text-red-600 hover:text-red-400"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* MOBILE MENU */}
      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-neutral-300 border-t shadow"
          >
            <nav className="flex flex-col p-4 space-y-3">
              {/* MAIN LINKS */}
              {[{ href: "/contact", label: "Contact" }].map((item) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded text-gray-800 hover:bg-neutral-400"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* DIVIDER */}
              <div className="border-t border-neutral-400 my-2" />

              {/* AUTH / MORE SECTION */}
              {loggedIn ? (
                <>
                  <button
                    onClick={() => {
                      goToDashboard();
                      setMobileOpen(false);
                    }}
                    className="text-left px-3 py-2 rounded hover:bg-neutral-400"
                  >
                    Dashboard
                  </button>

                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded hover:bg-neutral-400"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/logout"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded text-red-600 hover:bg-red-100"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded hover:bg-neutral-400"
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
