import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  await connectDB();

  const password = "Test@12345"; // Change after creation!
  const hash = await bcrypt.hash(password, 10);

  const exists = await User.findOne({ role: "super_admin" });

  if (exists) {
    return Response.json(
      { message: "Super admin already exists" },
      { status: 400 }
    );
  }

  const super_admin = await User.create({
    name: "Main Super Admin",
    phone: "9738722032",
    password: hash,
    role: "super_admin",
    city: "000000000000000000000000", // Temporary dummy ObjectId
    area: "000000000000000000000000", // Temporary dummy ObjectId
  });

  return Response.json(
    { message: "Super admin created successfully", super_admin },
    { status: 201 }
  );
}
