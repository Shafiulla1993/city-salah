// src/app/api/super-admin/thoughts/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import ThoughtOfDay from "@/models/ThoughtOfDay";

export const GET = withAuth("super_admin", async (req) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const filter = {};

  if (status) filter.status = status;
  if (search) filter.text = { $regex: search, $options: "i" };

  // Auto-archive expired published thoughts
  await ThoughtOfDay.updateMany(
    { status: "published", endDate: { $lt: new Date() } },
    { $set: { status: "archived" } },
  );

  const data = await ThoughtOfDay.find(filter).sort({ startDate: -1 }).lean();

  return Response.json({ success: true, data });
});

export const POST = withAuth("super_admin", async (req, ctx) => {
  const { fields } = await import("@/lib/middleware/parseMultipart").then((m) =>
    m.parseMultipart(req),
  );
  const user = ctx.user;

  const { text, startDate, endDate, status = "draft", images = [] } = fields;

  if (!text || !startDate || !endDate) {
    return Response.json(
      { success: false, message: "Text and date range required" },
      { status: 400 },
    );
  }

  const s = new Date(startDate);
  const e = new Date(endDate);

  if (s > e) {
    return Response.json(
      { success: false, message: "Invalid date range" },
      { status: 400 },
    );
  }

  if (status === "published") {
    const clash = await ThoughtOfDay.findOne({
      status: "published",
      startDate: { $lte: e },
      endDate: { $gte: s },
    });

    if (clash) {
      return Response.json(
        {
          success: false,
          message: "Another thought already active in this range",
        },
        { status: 400 },
      );
    }
  }

  const doc = await ThoughtOfDay.create({
    text,
    images: Array.isArray(images) ? images : [images],
    startDate: s,
    endDate: e,
    status,
    createdBy: user._id,
  });

  return Response.json({ success: true, data: doc }, { status: 201 });
});
