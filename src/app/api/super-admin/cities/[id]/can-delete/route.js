// src/app/api/super-admin/cities/[id]/can-delete

import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import Area from "@/models/Area";
import User from "@/models/User";
import Masjid from "@/models/Masjid";

// GET /api/super-admin/cities/:id/can-delete
export const GET = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const [linkedAreas, linkedUsers, linkedMasjids] = await Promise.all([
    Area.countDocuments({ city: id }),
    User.countDocuments({ city: id }),
    Masjid.countDocuments({ city: id }),
  ]);

  const canDelete =
    linkedAreas === 0 && linkedUsers === 0 && linkedMasjids === 0;

  return {
    status: 200,
    json: {
      success: true,
      canDelete,
      linkedAreas,
      linkedUsers,
      linkedMasjids,
    },
  };
});
