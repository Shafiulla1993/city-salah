// src/app/api/super-admin/cities/[id]/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import City from "@/models/City";
import Area from "@/models/Area";
import User from "@/models/User";
import Masjid from "@/models/Masjid";
import { generateSlug } from "@/lib/helpers/slugHelper";

// GET /api/super-admin/cities/:id
export const GET = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const city = await City.findById(id).lean();
  if (!city) {
    return {
      status: 404,
      json: { success: false, message: "City not found" },
    };
  }

  return {
    status: 200,
    json: { success: true, data: city },
  };
});

// PUT /api/super-admin/cities/:id
export const PUT = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const city = await City.findById(id);
  if (!city) {
    return {
      status: 404,
      json: { success: false, message: "City not found" },
    };
  }

  if (body.lat && body.lon) {
    city.coords = { lat: Number(body.lat), lon: Number(body.lon) };
  }

  if (body.name && body.name.trim() !== city.name) {
    city.name = body.name.trim();
    city.slug = generateSlug(body.name);
  }

  if (body.timezone) {
    city.timezone = body.timezone;
  }

  await city.save();

  return {
    status: 200,
    json: {
      success: true,
      message: "City updated successfully",
      data: city,
    },
  };
});

// DELETE /api/super-admin/cities/:id
export const DELETE = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const [areasCount, usersCount, masjidsCount] = await Promise.all([
    Area.countDocuments({ city: id }),
    User.countDocuments({ city: id }),
    Masjid.countDocuments({ city: id }),
  ]);

  if (areasCount > 0 || usersCount > 0 || masjidsCount > 0) {
    return {
      status: 400,
      json: {
        success: false,
        message: "City cannot be deleted because it is in use",
        linkedAreas: areasCount,
        linkedUsers: usersCount,
        linkedMasjids: masjidsCount,
      },
    };
  }

  await City.findByIdAndDelete(id);

  return {
    status: 200,
    json: { success: true, message: "City deleted successfully" },
  };
});
