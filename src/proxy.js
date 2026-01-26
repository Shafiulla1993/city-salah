// src/proxy.js

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/mongoRateLimiter";
import { verifyToken } from "@/lib/auth/token";
import { authCookie } from "@/lib/auth/cookies";

export async function proxy(request) {
  const path = request.nextUrl.pathname;

  // 🚫 REMOVE ALL QIBLA REWRITE LOGIC (LOCKED)
  // Qibla routing is now handled by Next.js pages:
  // /qibla
  // /qibla/your-location
  // /city/area/qibla

  // 🔐 Protected routes
  const protectedPaths = ["/dashboard", "/super-admin", "/masjid-admin"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get(authCookie.name)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (
      path.startsWith("/dashboard/super-admin") &&
      decoded.role !== "super_admin"
    ) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (
      path.startsWith("/dashboard/masjid-admin") &&
      !["masjid_admin", "super_admin"].includes(decoded.role)
    ) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  // 🚦 Rate limit public APIs
  if (path.startsWith("/api/public")) {
    const result = await rateLimit(request, {
      keyPrefix: "public",
      limit: 100,
      windowSec: 60,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: "Too many requests, please try again later." },
        { status: 429 },
      );
    }
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    "/qibla/:path*",
    "/dashboard/:path*",
    "/super-admin/:path*",
    "/masjid-admin/:path*",
    "/api/public/:path*",
  ],
};
