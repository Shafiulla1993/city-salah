// src/server/controllers/superadmin/users.controller.js
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";

/**
 * Each function returns: { status: number, json: any }
 */

export async function getAllUsersController() {
  const users = await User.find().select("-passwordHash").populate("city area");
  return { status: 200, json: users };
}

export async function getUserByIdController({ id }) {
  const user = await User.findById(id)
    .select("-passwordHash")
    .populate("city area");
  if (!user) return { status: 404, json: { message: "User not found" } };
  return { status: 200, json: user };
}

export async function createUserController({ body }) {
  const { name, email, phone, password, city, area, role, masjidId } = body;
  if (!name || !phone || !password || !city || !area)
    return { status: 400, json: { message: "All fields are required" } };

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser)
    return { status: 400, json: { message: "Email or phone already exists" } };

  const cityObj =
    (mongoose.isValidObjectId(city) && (await City.findById(city))) ||
    (await City.findOne({ name: city }));
  if (!cityObj) return { status: 404, json: { message: "City not found" } };

  const areaObj =
    (mongoose.isValidObjectId(area) && (await Area.findById(area))) ||
    (await Area.findOne({ name: area, city: cityObj._id }));
  if (!areaObj) return { status: 404, json: { message: "Area not found" } };

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    phone,
    password: passwordHash,
    city: cityObj._id,
    area: areaObj._id,
    role: role || "public",
    masjidId: masjidId || [],
  });

  const userToReturn = await User.findById(user._id)
    .select("-passwordHash")
    .populate("city area");
  return { status: 201, json: userToReturn };
}

export async function updateUserController({ id, body }) {
  const { name, email, phone, password, city, area, masjidId, role } = body;
  const user = await User.findById(id);
  if (!user) return { status: 404, json: { message: "User not found" } };

  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return { status: 400, json: { message: "Email already in use" } };
  }

  if (phone && phone !== user.phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return { status: 400, json: { message: "Phone already in use" } };
  }

  const allowedRoles = ["public", "masjid_admin", "super_admin"];
  if (role && !allowedRoles.includes(role))
    return { status: 400, json: { message: "Invalid role value" } };

  let cityObj = user.city;
  if (city) {
    cityObj =
      (mongoose.isValidObjectId(city) && (await City.findById(city))) ||
      (await City.findOne({ name: city }));
    if (!cityObj) return { status: 404, json: { message: "City not found" } };
  }

  let areaObj = user.area;
  if (area) {
    areaObj =
      (mongoose.isValidObjectId(area) && (await Area.findById(area))) ||
      (await Area.findOne({ name: area, city: cityObj._id }));
    if (!areaObj) return { status: 404, json: { message: "Area not found" } };
  }

  let passwordHash = user.passwordHash;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  }

  if (masjidId && masjidId.length > 0) {
    const validMasjids = await Masjid.find({ _id: { $in: masjidId } });
    if (validMasjids.length !== masjidId.length)
      return {
        status: 400,
        json: { message: "One or more invalid Masjid IDs" },
      };
  }

  const allowedUpdates = {
    name,
    email,
    phone,
    passwordHash,
    city: cityObj._id,
    area: areaObj._id,
    role,
  };

  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  if (role === "public") {
    allowedUpdates.masjidId = [];
  } else if (masjidId !== undefined) {
    allowedUpdates.masjidId = masjidId;
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: allowedUpdates },
    { new: true }
  )
    .select("-passwordHash")
    .populate("city area masjidId");

  return {
    status: 200,
    json: { message: "User updated successfully", user: updatedUser },
  };
}

export async function deleteUserController({ id }) {
  const user = await User.findByIdAndDelete(id);
  if (!user) return { status: 404, json: { message: "User not found" } };
  return { status: 200, json: { message: "User deleted successfully" } };
}
