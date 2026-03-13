const mongoose = require("mongoose");

/**
 * SCHÉMA UTILISATEUR
 * Définit la structure d'un document utilisateur dans MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    // Nom d'utilisateur unique
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur est requis"],
      unique: true,
      trim: true, // Supprime les espaces
      minlength: [3, "Le nom doit contenir au moins 3 caractères"],
    },

    // Email unique et en minuscules
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true, // Convertit en minuscules
      match: [/^\S+@\S+\.\S+$/, "Email invalide"], // Notez le \ avant le S
    },

    // Mot de passe haché (JAMAIS en clair !)
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },

    // Biographie (optionnelle)
    bio: {
      type: String,
      maxlength: [500, "La bio ne peut dépasser 500 caractères"],
      default: "",
    },

    // URL de l'avatar
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150",
    },

    // Liste des abonnés (références vers d'autres Users)
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Référence au modèle User
      },
    ],

    // Liste des abonnements
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Date de création automatique
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Options du schéma
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  },
);

/**
 * MÉTHODE VIRTUELLE
 * Calcule le nombre d'abonnés sans le stocker en BD
 */
userSchema.virtual("followerCount").get(function () {
  return this.followers.length;
});

/**
 * MÉTHODE D'INSTANCE
 * Retourne un objet utilisateur sans le mot de passe
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Ne jamais retourner le mot de passe
  return user;
};

// Export du modèle
module.exports = mongoose.model("User", userSchema);
