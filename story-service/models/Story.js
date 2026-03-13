const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "Le contenu de la story est requis"],
      maxlength: [500, "La story ne peut dépasser 500 caractères"],
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.*/.test(v);
        },
        message: "URL média invalide",
      },
    },
    mediaType: {
      type: String,
      enum: ["none", "image", "video"],
      default: "none",
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ visibility: 1, createdAt: -1 });

storySchema.pre("save", function (next) {
  if (Array.isArray(this.viewers)) {
    const ownerIdStr = this.userId ? this.userId.toString() : null;
    this.viewers = this.viewers
      .map((id) => id.toString())
      .filter((id) => id !== ownerIdStr);
    this.viewers = [...new Set(this.viewers)];
    this.viewers = this.viewers.map((id) => new mongoose.Types.ObjectId(id));
    this.viewsCount = this.viewers.length;
  }
  next();
});

storySchema.methods.hasViewed = function (userId) {
  if (!userId) return false;
  const userIdStr = userId.toString();
  return this.viewers.some((id) => id.toString() === userIdStr);
};

storySchema.methods.addView = function (userId) {
  if (!userId) {
    throw new Error("User ID requis pour enregistrer une vue");
  }

  if (this.userId && this.userId.toString() === userId.toString()) {
    return Promise.resolve(this);
  }

  if (!this.hasViewed(userId)) {
    this.viewers.push(userId);
  }

  return this.save();
};

module.exports = mongoose.model("Story", storySchema);
