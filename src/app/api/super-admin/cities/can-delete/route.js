// src/app/api/super-admin/cities/can-delete

import { withAuth } from "@/lib/middleware/withAuth";
import { canDeleteCityController } from "@/server/controllers/superadmin/cities.controller";
import connectDB from "@/lib/db";

export const GET = withAuth("super_admin", async ({ request }) => {
  await connectDB();

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return Response.json(
      { success: false, message: "City ID required" },
      { status: 400 }
    );
  }

  const result = await canDeleteCityController({ id });
  return Response.json(result.json, { status: result.status });
});
