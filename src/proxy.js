import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/mongoRateLimiter";

// New Proxy Handler (replaces "middleware")
export async function proxy(request) {
  const path = request.nextUrl.pathname;

  // Apply rate limit only on public API routes
  if (path.startsWith("/api/public")) {
    const result = await rateLimit(request, {
      keyPrefix: "public",
      limit: 100, // 100 requests
      windowSec: 60, // per minute
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Too many requests, please try again later.",
          retryAfter: result.retryAfter,
        },
        { status: 429 }
      );
    }
  }

  // Continue normally
  return NextResponse.next();
}

// New config name: proxyConfig (replaces "config")
export const proxyConfig = {
  matcher: ["/api/public/:path*"],
};
