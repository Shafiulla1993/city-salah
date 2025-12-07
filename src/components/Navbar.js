// src/components/Navbar.js

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function ModernNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const { loggedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // hide on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 70) setHidden(true);
      else setHidden(false);
      setLastScroll(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "super_admin") router.push("/dashboard/super-admin");
    else if (user.role === "masjid_admin")
      router.push("/dashboard/masjid-admin");
    else router.push("/");
  };

  const isActive = (path) =>
    pathname === path ? "text-white underline font-semibold" : "text-stone-900";

  return (
    <div className="group fixed top-0 left-0 right-0 z-50">
      <header
        className={`bg-slate-400 shadow-lg transition-transform duration-500 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Back + Logo */}
            <div className="flex items-center gap-3">
              {pathname !== "/" && (
                <button
                  onClick={() => router.back()}
                  className="text-white bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-900 transition"
                >
                  ←
                </button>
              )}

              <div
                className="cursor-pointer flex items-center"
                onClick={() => router.push("/")}
              >
                <Image
                  src="/Design-logo.png"
                  alt="City Salah Logo"
                  width={180} // can be any
                  height={50} // doesn't matter much, we'll control with class
                  className="h-10 md:h-12 lg:h-14 w-auto object-contain drop-shadow"
                  priority
                />
              </div>
            </div>

            {/* ⭐ Mobile — show main 3 links outside hamburger */}
            <div className="flex md:hidden items-center gap-4">
              <Link href="/" className={`${isActive("/")} text-sm`}>
                Home
              </Link>

              <Link
                href="/updates"
                className={`${isActive("/updates")} text-sm`}
              >
                Updates
              </Link>

              <Link
                href="/auqatus-salah"
                className={`${isActive(
                  "/auqatus-salah"
                )} text-sm whitespace-nowrap`}
              >
                Auqaatus Salah
              </Link>

              {/* Hamburger for remaining items */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>

            {/* Desktop Menu — unchanged */}
            <nav className="hidden md:flex space-x-6 items-center">
              <Link
                href="/"
                className={`${isActive("/")} hover:text-white transition`}
              >
                Home
              </Link>
              <Link
                href="/updates"
                className={`${isActive(
                  "/updates"
                )} hover:text-white transition`}
              >
                Updates
              </Link>
              <Link
                href="/auqatus-salah"
                className={`${isActive(
                  "/auqatus-salah"
                )} hover:text-white transition`}
              >
                Auqatus Salah
              </Link>

              <Link
                href="/contact"
                className="text-gray-900 hover:text-white transition"
              >
                Contact Us
              </Link>

              {loggedIn && (
                <button
                  onClick={goToDashboard}
                  className="text-gray-900 hover:text-white transition"
                >
                  Dashboard
                </button>
              )}

              {loggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-900 hover:text-white transition"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/logout"
                    className="text-red-600 hover:text-red-400 transition"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-900 hover:text-white transition"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile Hamburger Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <nav className="flex flex-col space-y-2 p-4">
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600"
              >
                Contact Us
              </Link>

              {loggedIn && (
                <button
                  onClick={() => {
                    goToDashboard();
                    setMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 text-left"
                >
                  Dashboard
                </button>
              )}

              {loggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/logout"
                    onClick={() => setMenuOpen(false)}
                    className="text-red-600 hover:text-red-400"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
