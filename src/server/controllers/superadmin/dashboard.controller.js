// src/server/controllers/superadmin/dashboard.controller.js
import User from "@/models/User";
import Masjid from "@/models/Masjid";
import GeneralAnnouncement from "@/models/GeneralAnnouncement";

export async function dashboardSummaryController() {
  const usersCount = await User.countDocuments();
  const masjidsCount = await Masjid.countDocuments();
  const announcementsCount = await GeneralAnnouncement.countDocuments();

  return {
    status: 200,
    json: { usersCount, masjidsCount, announcementsCount },
  };
}
