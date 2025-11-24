// src/server/controllers/superadmin/users.controller.js

import mongoose from "mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Area from "@/models/Area";
import Masjid from "@/models/Masjid";
import { paginate } from "@/server/utils/paginate";
import bcrypt from "bcryptjs";

/**
 * Get all users (paginated)
 */
export async function getUsersController({ query } = {}) {
  try {
    const { page, limit, search, cityId, areaId, role } = query || {};
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (cityId && mongoose.isValidObjectId(cityId)) filter.city = cityId;
    if (areaId && mongoose.isValidObjectId(areaId)) filter.area = areaId;

    const result = await paginate(User, {
      page,
      limit,
      filter,
      populate: [
        { path: "city", select: "name" },
        { path: "area", select: "name" },
        { path: "masjidId", select: "name" },
      ],
      sort: { createdAt: -1, _id: -1 },
      projection: { password: 0 },
    });

    // 🔥 FIX: Use result.json.data (correct key)
    return {
      status: 200,
      json: {
        success: true,
        data: result.json.data,
        pagination: {
          page: result.json.page,
          limit: result.json.limit,
          total: result.json.total,
        },
      },
    };
  } catch (err) {
    console.error("getUsersController error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Server error",
        error: err.message,
      },
    };
  }
}

/**
 * Get single user (no password)
 */
export async function getUserController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid user id" },
      };

    const user = await User.findById(id)
      .select("-password")
      .populate("city area masjidId");

    if (!user)
      return {
        status: 404,
        json: { success: false, message: "User not found" },
      };

    return { status: 200, json: { success: true, data: user } };
  } catch (err) {
    console.error("getUserController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Create user
 */
export async function createUserController({ body = {} }) {
  try {
    const {
      name,
      email,
      phone,
      password,
      city,
      area,
      role,
      masjidId,
      imageUrl,
    } = body;

    if (!name || !phone || !password || !city || !area) {
      return {
        status: 400,
        json: {
          success: false,
          message: "name, phone, password, city and area are required",
        },
      };
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return {
        status: 400,
        json: { success: false, message: "Phone already in use" },
      };

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return {
          status: 400,
          json: { success: false, message: "Email already in use" },
        };
    }

    // Resolve IDs
    let cityId = city;
    if (!mongoose.isValidObjectId(city)) {
      const c = await City.findOne({
        name: { $regex: `^${city}$`, $options: "i" },
      });
      if (!c)
        return {
          status: 404,
          json: { success: false, message: `City not found: ${city}` },
        };
      cityId = c._id;
    }

    let areaId = area;
    if (!mongoose.isValidObjectId(area)) {
      const a = await Area.findOne({
        name: { $regex: `^${area}$`, $options: "i" },
        city: cityId,
      });
      if (!a)
        return {
          status: 404,
          json: { success: false, message: `Area not found: ${area}` },
        };
      areaId = a._id;
    }

    let masjidArray = [];
    if (masjidId) {
      masjidArray = Array.isArray(masjidId) ? masjidId : [masjidId];
      const validMasjids = await Masjid.find({ _id: { $in: masjidArray } });
      if (validMasjids.length !== masjidArray.length) {
        return {
          status: 400,
          json: {
            success: false,
            message: "One or more masjidId values are invalid",
          },
        };
      }
    }

    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      city: cityId,
      area: areaId,
      role: role || "public",
      masjidId: masjidArray,
      imageUrl: imageUrl || null,
    });

    const created = await User.findById(user._id)
      .select("-password")
      .populate("city area masjidId");

    return {
      status: 201,
      json: { success: true, message: "User created", data: created },
    };
  } catch (err) {
    console.error("createUserController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Update user
 */
export async function updateUserController({ id, body = {} }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid user id" },
      };

    const user = await User.findById(id);
    if (!user)
      return {
        status: 404,
        json: { success: false, message: "User not found" },
      };

    if (body.phone && body.phone !== user.phone) {
      const existingPhone = await User.findOne({ phone: body.phone });
      if (existingPhone)
        return {
          status: 400,
          json: { success: false, message: "Phone already in use" },
        };
    }

    if (body.email && body.email !== user.email) {
      const existingEmail = await User.findOne({ email: body.email });
      if (existingEmail)
        return {
          status: 400,
          json: { success: false, message: "Email already in use" },
        };
    }

    const allowedRoles = ["public", "masjid_admin", "super_admin"];
    if (body.role && !allowedRoles.includes(body.role))
      return {
        status: 400,
        json: { success: false, message: "Invalid role value" },
      };

    // Resolve new city/area IDs
    if (body.city && !mongoose.isValidObjectId(body.city)) {
      const c = await City.findOne({
        name: { $regex: `^${body.city}$`, $options: "i" },
      });
      if (!c)
        return {
          status: 404,
          json: { success: false, message: `City not found: ${body.city}` },
        };
      body.city = c._id;
    }

    if (body.area && !mongoose.isValidObjectId(body.area)) {
      const a = await Area.findOne({
        name: { $regex: `^${body.area}$`, $options: "i" },
        city: body.city || user.city,
      });
      if (!a)
        return {
          status: 404,
          json: { success: false, message: `Area not found: ${body.area}` },
        };
      body.area = a._id;
    }

    let masjidArray;
    if (body.masjidId !== undefined) {
      masjidArray = Array.isArray(body.masjidId)
        ? body.masjidId
        : [body.masjidId];

      const validMasjids = await Masjid.find({ _id: { $in: masjidArray } });
      if (validMasjids.length !== masjidArray.length) {
        return {
          status: 400,
          json: {
            success: false,
            message: "One or more masjidId values are invalid",
          },
        };
      }
    }

    if (body.password) {
      body.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10));
    }

    const updatable = [
      "name",
      "email",
      "phone",
      "password",
      "city",
      "area",
      "role",
      "imageUrl",
    ];

    updatable.forEach((k) => {
      if (body[k] !== undefined) user[k] = body[k];
    });

    if (body.role === "public") {
      user.masjidId = [];
    } else if (masjidArray !== undefined) {
      user.masjidId = masjidArray;
    }

    await user.save();

    const saved = await User.findById(user._id)
      .select("-password")
      .populate("city area masjidId");

    return {
      status: 200,
      json: { success: true, message: "User updated", data: saved },
    };
  } catch (err) {
    console.error("updateUserController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}

/**
 * Delete user
 */
export async function deleteUserController({ id }) {
  try {
    if (!mongoose.isValidObjectId(id))
      return {
        status: 400,
        json: { success: false, message: "Invalid user id" },
      };

    await User.findByIdAndDelete(id);
    return { status: 200, json: { success: true, message: "User deleted" } };
  } catch (err) {
    console.error("deleteUserController error:", err);
    return {
      status: 500,
      json: { success: false, message: "Server error", error: err.message },
    };
  }
}
