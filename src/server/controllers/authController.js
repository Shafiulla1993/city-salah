// src/server/controllers/authController

import bcrypt from "bcryptjs";
import User from "@/models/User";
import City from "@/models/City";
import Area from "@/models/Area";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../utils/createTokens";

export const registerUser = async (data) => {
  const { name, email, phone, password, city, area } = data;

  if (!name || !phone || !password || !city || !area) {
    return { status: 400, json: { message: "All fields are required" } };
  }

  const exists = await User.findOne({ phone });
  if (exists) {
    return { status: 400, json: { message: "Phone already exists" } };
  }

  const cityExists = await City.findById(city);
  const areaExists = await Area.findById(area);

  if (!cityExists || !areaExists) {
    return { status: 400, json: { message: "Invalid city or area" } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone,
    password: passwordHash,
    city,
    area,
    role: "public",
  });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return {
    status: 201,
    json: {
      message: "User registered",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        city,
        area,
        role: user.role,
      },
      accessToken, // for mobile app
      refreshToken, // for mobile app
    },
    cookies: { accessToken, refreshToken }, // for web
  };
};

export async function loginUser({ phone, password }) {
  if (!phone || !password) {
    return { json: { message: "Phone and password required" }, status: 400 };
  }

  const user = await User.findOne({ phone });
  if (!user)
    return { json: { message: "Phone or Password incorrect" }, status: 404 };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return { json: { message: "Phone or Password incorrect" }, status: 401 };

  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return {
    json: {
      user: { id: user._id, name: user.name, role: user.role },
      message: "Login successful",
    },
    status: 200,
    cookies: { accessToken, refreshToken },
  };
}
