// src/lib/auth/cookies.js

const isProd = process.env.NODE_ENV === "production";

export const authCookie = {
  name: "citysalah_token",
  options: {
    httpOnly: true,
    secure: isProd,   // false on localhost
    sameSite: "lax",  // works on localhost
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
