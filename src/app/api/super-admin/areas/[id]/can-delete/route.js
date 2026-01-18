// src/app/api/super-admin/areas/[id]/can-delete/route.js
import connectDB from "@/lib/db";
import { withAuth } from "@/lib/middleware/withAuth";
import Masjid from "@/models/Masjid";
import User from "@/models/User";

// GET /api/super-admin/areas/:id/can-delete
export const GET = withAuth("super_admin", async (request, { params }) => {
  await connectDB();

  const { id } = await params;

  const [linkedMasjids, linkedUsers] = await Promise.all([
    Masjid.countDocuments({ area: id }),
    User.countDocuments({ area: id }),
  ]);

  const canDelete = linkedMasjids === 0 && linkedUsers === 0;

  return {
    status: 200,
    json: {
      success: true,
      canDelete,
      linkedMasjids,
      linkedUsers,
    },
  };
});
