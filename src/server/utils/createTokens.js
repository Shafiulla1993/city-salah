// src/server/utils/createToken

import jwt from "jsonwebtoken";

export function createAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // short expiry
  );
}

export function createRefreshToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // long expiry
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: false,
    });
  } catch (err) {
    return null; // Force "not logged in"
  }
}
