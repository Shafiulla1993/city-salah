// src/lib/auth/token.js

import jwt from "jsonwebtoken";

const TOKEN_EXPIRE = "30d"; // sliding session (auto-extend on activity)

export function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRE }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}
