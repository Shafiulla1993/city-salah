// src/server/utils/createTokens.js

import jwt from "jsonwebtoken";

const ACCESS_EXPIRE = process.env.ACCESS_EXPIRE || "15m";

const REFRESH_EXPIRE = process.env.REFRESH_EXPIRE || "7d";

/* ---------------- ACCESS TOKEN ---------------- */

export function createAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRE }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/* ---------------- REFRESH TOKEN ---------------- */

export function createRefreshToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRE,
  });
}

export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log("REFRESH VERIFIED:", decoded);
    return decoded;
  } catch (err) {
    console.error("REFRESH VERIFY ERROR:", err.message);
    return null;
  }
}
