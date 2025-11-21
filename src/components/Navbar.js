"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ModernNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { loggedIn, user } = useAuth();
  const router = useRouter();

  // Auto-hide after 5 sec
  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle dashboard redirect based on role
  const goToDashboard = () => {
    if (!user) return;

    if (user.role === "super_admin") {
      router.push("/dashboard/super-admin");
    } else if (user.role === "masjid_admin") {
      router.push("/dashboard/masjid-admin");
    } else {
      router.push("/"); // public → home
    }
  };

  return (
    <div className="group fixed top-0 left-0 right-0 z-50">
      <header
        className={`
          bg-slate-400 shadow-lg 
          transition-transform duration-500 
          ${hidden ? "-translate-y-full" : "translate-y-0"}
          group-hover:translate-y-0
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold text-gray-900 hover:text-white"
              >
                City Salah
              </Link>
            </div>

            {/* Desktop menu */}
            <nav className="hidden md:flex space-x-6 items-center">
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

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-900 hover:text-white focus:outline-none"
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
          </div>
        </div>

        {/* Mobile menu */}
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

      {/* Hover zone */}
      <div className="h-3 w-full group-hover:h-6"></div>
    </div>
  );
}
