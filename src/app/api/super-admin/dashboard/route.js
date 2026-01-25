// src/app/api/super-admin/dashboard/route.js

// src/app/api/super-admin/dashboard/route.js

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth";
import User from "@/models/User";
import Masjid from "@/models/Masjid";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";
import City from "@/models/City";
import Area from "@/models/Area";

export const GET = withAuth("super_admin", async () => {
  const usersCount = await User.countDocuments();
  const masjidsCount = await Masjid.countDocuments();
  const announcementsCount = await GeneralAnnouncement.countDocuments();
  const citiesCount = await City.countDocuments();
  const areasCount = await Area.countDocuments();

  return NextResponse.json({
    usersCount,
    masjidsCount,
    announcementsCount,
    citiesCount,
    areasCount,
  });
});
