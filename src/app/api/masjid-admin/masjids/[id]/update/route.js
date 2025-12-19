// src/app/api/masjid-admin/masjids/[id]/update/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import fs from "fs/promises";
import Masjid from "@/models/Masjid";
import cloudinary from "@/lib/cloudinary";
import { updateMasjidController } from "@/server/controllers/masjidAdmin/masjids.controller";

export const PUT = withAuth("masjid_admin", async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();

  return await updateMasjidController({
    id,
    imageUrl: body.imageUrl,
    imagePublicId: body.imagePublicId,
    contacts: body.contacts,
    prayerRules: body.prayerRules,
    user: ctx.user,
  });
});
