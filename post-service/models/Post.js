const mongoose = require("mongoose");

/**
 * SCHÉMA POST
 * Représente une publication sur le réseau social
 */
const postSchema = new mongoose.Schema(
  {
    // Référence vers l'utilisateur qui a créé le post
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence au modèle User (dans user-service)
      required: true,
    },

    // Contenu textuel du post
    content: {
      type: String,
      required: [true, "Le contenu est requis"],
      maxlength: [2000, "Le contenu ne peut dépasser 2000 caractères"],
      trim: true,
    },

    // URLs des images (tableau)
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            // Validation URL simple
            return /^https?:\/\/.*/.test(v);
          },
          message: "URL d'image invalide",
        },
      },
    ],

    // Nombre de likes (dénormalisé pour performance)
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Utilisateurs ayant liké le post
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Nombre de commentaires
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Nombre de partages
    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Visibilité du post
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },

    // Métadonnées temporelles
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Gère automatiquement createdAt et updatedAt
  },
);

/**
 * INDEX
 * Améliore les performances des requêtes
 */

// Index pour rechercher par utilisateur
postSchema.index({ userId: 1, createdAt: -1 });

// Index pour le feed public
postSchema.index({ visibility: 1, createdAt: -1 });

// Index multi-clés pour requêtes sur les likes par utilisateur
postSchema.index({ likedBy: 1 });

/**
 * MÉTHODES D'INSTANCE
 */

// Synchroniser automatiquement likesCount avec le nombre réel de likes
postSchema.pre("save", function (next) {
  if (Array.isArray(this.likedBy)) {
    this.likedBy = [...new Set(this.likedBy.map((id) => id.toString()))];
    this.likedBy = this.likedBy.map((id) => new mongoose.Types.ObjectId(id));
    this.likesCount = this.likedBy.length;
  }
  next();
});

// Ajouter un like pour un utilisateur connecté
postSchema.methods.addLike = function (userId) {
  if (!userId) {
    throw new Error("User ID requis pour liker un post");
  }

  const userIdStr = userId.toString();
  const alreadyLiked = this.likedBy.some((id) => id.toString() === userIdStr);

  if (!alreadyLiked) {
    this.likedBy.push(userId);
  }

  return this.save();
};

// Retirer un like pour un utilisateur connecté
postSchema.methods.removeLike = function (userId) {
  if (!userId) {
    throw new Error("User ID requis pour retirer le like");
  }

  const userIdStr = userId.toString();
  this.likedBy = this.likedBy.filter((id) => id.toString() !== userIdStr);

  return this.save();
};

// Vérifier si un utilisateur a déjà liké
postSchema.methods.hasLiked = function (userId) {
  if (!userId) return false;
  const userIdStr = userId.toString();
  return this.likedBy.some((id) => id.toString() === userIdStr);
};

// Compatibilité avec ancien code
postSchema.methods.incrementLikes = function (userId) {
  return this.addLike(userId);
};

postSchema.methods.decrementLikes = function (userId) {
  return this.removeLike(userId);
};

module.exports = mongoose.model("Post", postSchema);
