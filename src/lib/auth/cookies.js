// src/lib/auth/cookies.js

const isProd = process.env.NODE_ENV === "production";

/**
 * Access Token Cookie
 * - Short lived
 * - Sent on every request
 */
export const accessTokenCookie = {
  name: "accessToken",
  options: {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  },
};

/**
 * Refresh Token Cookie
 * - Long lived
 * - Restricted path
 * - Extra protection
 */
export const refreshTokenCookie = {
  name: "refreshToken",
  options: {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
