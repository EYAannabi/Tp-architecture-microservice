const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Post",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu du commentaire est requis"],
      maxlength: [1000, "Le commentaire ne peut dépasser 1000 caractères"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
