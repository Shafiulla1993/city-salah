// src/app/api/auth/reisgter/route.js


import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import City from "@/models/City";
import Area from "@/models/Area";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/mail/mailer";
import { verifyEmailTemplate } from "@/lib/mail/templates/verifyEmail";

export async function POST(req) {
  await connectDB();

  const { name, email, phone, password, city, area } = await req.json();

  if (!name || !email || !phone || !password || !city || !area) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }],
  });

  if (existing) {
    return NextResponse.json({ message: "Email or phone already registered" }, { status: 400 });
  }

  const cityExists = await City.findById(city);
  const areaExists = await Area.findById(area);

  if (!cityExists || !areaExists) {
    return NextResponse.json({ message: "Invalid city or area" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyHash = crypto.createHash("sha256").update(verifyToken).digest("hex");

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    city,
    area,
    role: "public",
    emailVerified: false,
    emailVerifyToken: verifyHash,
    emailVerifyExpire: Date.now() + 1000 * 60 * 60 * 24, // 24h
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const verifyLink = `${baseUrl}/auth/verify-email?token=${verifyToken}`;


  await sendMail({
    to: user.email,
    subject: "Verify your CitySalah account",
    html: verifyEmailTemplate({
      name: user.name,
      link: verifyLink,
    }),
  });

  return NextResponse.json({
    success: true,
    message: "Registration successful. Verification email sent.",
  });
}
