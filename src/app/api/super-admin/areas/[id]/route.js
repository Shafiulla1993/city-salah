// src/app/api/super-admin/areas/[id]/route.js

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import Area from "@/models/Area";
import { generateSlug } from "@/lib/helpers/slugHelper";

// GET /api/super-admin/areas/:id
export const GET = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const area = await Area.findById(id).populate("city", "name").lean();
  if (!area) {
    return {
      status: 404,
      json: { success: false, message: "Area not found" },
    };
  }

  return {
    status: 200,
    json: { success: true, data: area },
  };
});

// PUT /api/super-admin/areas/:id
export const PUT = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const area = await Area.findById(id);
  if (!area) {
    return {
      status: 404,
      json: { success: false, message: "Area not found" },
    };
  }

  if (body.name && body.name.trim() !== area.name) {
    const newSlug = generateSlug(body.name);

    const duplicate = await Area.findOne({
      city: area.city,
      slug: newSlug,
      _id: { $ne: id },
    });

    if (duplicate) {
      return {
        status: 400,
        json: {
          success: false,
          message: "Another area with this name exists in this city",
        },
      };
    }

    area.name = body.name.trim();
    area.slug = newSlug;
  }

  if (body.city) area.city = body.city;
  if (body.center) area.center = body.center;

  await area.save();

  return {
    status: 200,
    json: {
      success: true,
      message: "Area updated successfully",
      data: area,
    },
  };
});

// DELETE /api/super-admin/areas/:id
export const DELETE = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  await Area.findByIdAndDelete(id);

  return {
    status: 200,
    json: { success: true, message: "Area deleted successfully" },
  };
});
