const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authRequired = require("../middleware/auth");

/**
 * ROUTE : POST /api/users/register
 * Inscription d'un nouvel utilisateur
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ÉTAPE 1 : Validation des données
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Tous les champs sont requis",
      });
    }

    // ÉTAPE 2 : Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Utilisateur déjà existant",
      });
    }

    // ÉTAPE 3 : Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // ÉTAPE 4 : Créer l'utilisateur
    const user = new User({
      username,
      email,
      password: hashedPassword, // Mot de passe haché
    });

    await user.save();

    // ÉTAPE 5 : Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ÉTAPE 6 : Retourner la réponse
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ROUTE : POST /api/users/login
 * Connexion d'un utilisateur
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ÉTAPE 1 : Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis",
      });
    }

    // ÉTAPE 2 : Trouver l'utilisateur
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Identifiants invalides",
      });
    }

    // ÉTAPE 3 : Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Identifiants invalides",
      });
    }

    // ÉTAPE 4 : Générer le token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ÉTAPE 5 : Retourner la réponse
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ROUTE : GET /api/users/:id
 * Obtenir le profil d'un utilisateur
 */
router.get("/:id", async (req, res) => {
  try {
    // ÉTAPE 1 : Récupérer l'utilisateur par ID
    const user = await User.findById(req.params.id)
      .select("-password") // Exclure le mot de passe
      .populate("followers", "username avatar") // Joindre les followers
      .populate("following", "username avatar"); // Joindre les following

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    // ÉTAPE 2 : Retourner l'utilisateur
    res.json(user);
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ROUTE : POST /api/users/:id/follow
 * Suivre un utilisateur
 */
router.post("/:id/follow", authRequired, async (req, res) => {
  try {
    const userId = req.userId; // ID de l'utilisateur connecté
    const targetUserId = req.params.id; // ID de celui à suivre

    // ÉTAPE 1 : Validation
    if (userId === targetUserId) {
      return res.status(400).json({
        error: "Impossible de se suivre soi-même",
      });
    }

    // ÉTAPE 2 : Récupérer les deux utilisateurs
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    // ÉTAPE 3 : Vérifier si déjà suivi
    if (user.following.includes(targetUserId)) {
      return res.status(400).json({
        error: "Vous suivez déjà cet utilisateur",
      });
    }

    // ÉTAPE 4 : Ajouter aux listes
    user.following.push(targetUserId);
    targetUser.followers.push(userId);

    // ÉTAPE 5 : Sauvegarder
    await user.save();
    await targetUser.save();

    res.json({
      message: "Utilisateur suivi avec succès",
    });
  } catch (error) {
    console.error("Erreur follow:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * ROUTE : DELETE /api/users/:id/unfollow
 * Ne plus suivre un utilisateur
 */
router.delete("/:id/unfollow", authRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const targetUserId = req.params.id;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Retirer des listes
    user.following = user.following.filter(
      (id) => id.toString() !== targetUserId,
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== userId,
    );

    await user.save();
    await targetUser.save();

    res.json({
      message: "Utilisateur non suivi",
    });
  } catch (error) {
    console.error("Erreur unfollow:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
