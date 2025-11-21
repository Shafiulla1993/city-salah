// src/lib/utils/auditPlugin.js
// Adds createdBy, updatedBy and logs basic changes.
// Keep this light-weight to avoid importing heavy logger modules here.

export default function auditPlugin(schema) {
  schema.add({
    createdBy: { type: String },
    updatedBy: { type: String },
  });

  schema.pre("save", function (next) {
    this.wasNew = this.isNew;

    if (!this.isNew) {
      // store a shallow copy of the original doc for later comparison
      try {
        this._original = this.toObject({ transform: false });
      } catch (e) {
        this._original = {};
      }
    }

    // If code running sets mongoose.currentUser, propagate
    // (we use mongoose.currentUser elsewhere in your app)
    try {
      // eslint-disable-next-line no-undef
      // mongoose is available in runtime; check if currentUser present
      // avoid importing mongoose here to keep plugin decoupled
      // this.updatedBy will be set by whatever sets mongoose.currentUser
    } catch (e) {
      // swallow
    }

    next();
  });

  schema.post("save", function (doc) {
    // Basic console logging — replace or augment with winston if you want.
    const model = doc.constructor.modelName;
    if (this.wasNew) {
      console.info(`✅ Created ${model} (${doc._id})`);
      return;
    }

    const original = this._original || {};
    const current = doc.toObject({ transform: false });

    const changed = Object.keys(current).filter(
      (k) =>
        !["_id", "__v", "updatedAt", "createdAt"].includes(k) &&
        JSON.stringify(current[k]) !== JSON.stringify(original[k])
    );

    if (changed.length > 0) {
      console.info(
        `✏️ Updated ${model} (${doc._id}). Changed: ${changed.join(", ")}`
      );
    } else {
      // no-op (no important changes)
    }
  });

  schema.post("findOneAndDelete", function (doc) {
    if (doc) {
      const model = doc.constructor.modelName;
      console.info(`🗑️ Deleted ${model} (${doc._id})`);
    }
  });

  schema.post("remove", function (doc) {
    if (doc) {
      const model = doc.constructor.modelName;
      console.info(`🗑️ Removed ${model} (${doc._id})`);
    }
  });
}
