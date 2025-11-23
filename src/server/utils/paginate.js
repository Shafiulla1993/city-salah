// src/server/utils/paginate.js

export async function paginate(
  model,
  {
    page = 1,
    limit = 10,
    filter = {},
    populate = null,
    sort = { createdAt: -1 },
    projection = null,
  } = {}
) {
  try {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const skip = (page - 1) * limit;

    let query = model
      .find(filter, projection)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean(); // 🔥 ensure plain objects

    if (populate) query = query.populate(populate);

    const data = await query;
    const total = await model.countDocuments(filter);

    return {
      status: 200,
      json: {
        success: true,
        data,
        page,
        limit,
        total,
      },
    };
  } catch (err) {
    console.error("paginate error:", err);
    return {
      status: 500,
      json: {
        success: false,
        message: "Pagination failed",
        error: err.message,
      },
    };
  }
}
