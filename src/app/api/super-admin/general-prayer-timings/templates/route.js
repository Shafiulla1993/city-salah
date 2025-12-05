// src/app/api/super-admin/general-prayer-timings/templates/route.js

import { withAuth } from "@/lib/middleware/withAuth";
import { parseMultipart } from "@/lib/middleware/parseMultipart";
import fs from "fs/promises";
import {
  getAllTemplatesController,
  createTemplateController,
  uploadCsvToTemplateController,
} from "@/server/controllers/superadmin/generalPrayerTimings.controller";

export const GET = withAuth("super_admin", async (request) => {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const res = await getAllTemplatesController({ query });
  return res;
});

export const POST = withAuth("super_admin", async (request, user) => {
  const { fields, files } = await parseMultipart(request).catch(() => ({
    fields: {},
    files: {},
  }));

  // If CSV present (multipart or JSON) -> upload handler
  if (files?.file || files?.csv || fields?.csv) {
    const csvText = fields?.csv;
    const filenameTemp = null;

    if (files?.file || files?.csv) {
      const file = files.file || files.csv;
      const filepath = file.filepath || file.path;
      return uploadCsvToTemplateController({ filepath, fields, user }).finally(
        async () => filepath && fs.unlink(filepath).catch(() => {})
      );
    }

    // JSON upload case -> no file, parse text directly
    return uploadCsvToTemplateController({
      filepath: null,
      fields,
      user,
      csvText,
    });
  }

  // Otherwise → normal JSON create
  const res = await createTemplateController({ body: fields, user });
  return res;
});
