// src/app/api/super-admin/thoughts/[id]/route.js
import { withAuth } from "@/lib/middleware/withAuth";
import ThoughtOfDay from "@/models/ThoughtOfDay";
import cloudinary from "@/lib/cloudinary";

function extractPublicId(url) {
  const clean = url.split("?")[0];
  const parts = clean.split("/");
  const file = parts.pop();
  const folder = parts.pop();
  const name = file.split(".")[0];
  return `${folder}/${name}`;
}

export const GET = withAuth("super_admin", async (req, { params }) => {
  const { id } = await params;

  const doc = await ThoughtOfDay.findById(id);
  if (!doc)
    return Response.json(
      { success: false, message: "Not found" },
      { status: 404 },
    );

  return Response.json({ success: true, data: doc });
});

export const PUT = withAuth("super_admin", async (req, { params, user }) => {
  const { id } = await params;
  const { fields } = await import("@/lib/middleware/parseMultipart").then((m) =>
    m.parseMultipart(req),
  );

  const doc = await ThoughtOfDay.findById(id);
  if (!doc)
    return Response.json(
      { success: false, message: "Not found" },
      { status: 404 },
    );

  const { text, startDate, endDate, status, images } = fields;

  const s = startDate ? new Date(startDate) : doc.startDate;
  const e = endDate ? new Date(endDate) : doc.endDate;

  if (status === "published") {
    const clash = await ThoughtOfDay.findOne({
      _id: { $ne: id },
      status: "published",
      startDate: { $lte: e },
      endDate: { $gte: s },
    });

    if (clash) {
      return Response.json(
        { success: false, message: "Another thought overlaps" },
        { status: 400 },
      );
    }
  }

  if (text !== undefined) doc.text = text;
  if (startDate) doc.startDate = s;
  if (endDate) doc.endDate = e;
  if (status) doc.status = status;
  if (images) doc.images = Array.isArray(images) ? images : [images];

  doc.updatedBy = user._id;
  doc.updatedAt = new Date();
  await doc.save();

  return Response.json({ success: true, data: doc });
});

export const DELETE = withAuth("super_admin", async (req, { params }) => {
  const { id } = await params;

  const doc = await ThoughtOfDay.findById(id);
  if (!doc)
    return Response.json(
      { success: false, message: "Not found" },
      { status: 404 },
    );

  // 🔥 delete images from Cloudinary
  if (Array.isArray(doc.images)) {
    for (const url of doc.images) {
      try {
        const publicId = extractPublicId(url);
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
      }
    }
  }

  await doc.deleteOne();

  return Response.json({ success: true, message: "Deleted" });
});
