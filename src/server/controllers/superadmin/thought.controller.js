// src/server/controllers/superadmin/thought.controller.js
import ThoughtOfDay from "@/models/ThoughtOfDay";

export async function createThoughtController({ body, user }) {
  const thought = await ThoughtOfDay.create({
    ...body,
    createdBy: user._id,
    displayDate: body.displayDate || null,
  });
  return { status: 201, json: thought };
}

export async function getThoughtsController() {
  const thoughts = await ThoughtOfDay.find().populate("city area");
  return { status: 200, json: thoughts };
}

export async function getThoughtController({ id }) {
  const t = await ThoughtOfDay.findById(id);
  if (!t) return { status: 404, json: { message: "Thought not found" } };
  return { status: 200, json: t };
}

export async function updateThoughtController({ id, body, user }) {
  const thought = await ThoughtOfDay.findById(id);
  if (!thought) return { status: 404, json: { message: "Thought not found" } };

  Object.keys(body).forEach((k) => (thought[k] = body[k]));
  thought.updatedBy = user._id;
  thought.updatedAt = new Date();
  const updated = await thought.save();
  return {
    status: 200,
    json: { message: "Thought updated", thought: updated },
  };
}

export async function deleteThoughtController({ id }) {
  await ThoughtOfDay.findByIdAndDelete(id);
  return { status: 200, json: { message: "Thought deleted" } };
}
