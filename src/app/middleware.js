// app/middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const { cookies, nextUrl } = req;

  // Public paths
  const publicPaths = ["/login", "/public"];
  if (publicPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next(); // let server component handle role checks
}

export const config = {
  matcher: ["/dashboard/:path*", "/super-admin/:path*", "/masjid-admin/:path*"],
};
