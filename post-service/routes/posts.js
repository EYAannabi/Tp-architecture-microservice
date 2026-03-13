const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authRequired = require("../middleware/auth");

/**
 * ROUTE : POST /api/posts
 * Créer un nouveau post
 */
router.post("/", authRequired, async (req, res) => {
  try {
    const { content, images, visibility } = req.body;
    const userId = req.userId;

    // Validation
    if (!content) {
      return res.status(400).json({
        error: "content est requis",
      });
    }

    // Créer le post
    const post = new Post({
      userId,
      content,
      images: images || [],
      visibility: visibility || "public",
    });

    await post.save();

    res.status(201).json({
      message: "Post créé",
      post,
    });
  } catch (error) {
    console.error("Erreur création post:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : GET /api/posts
 * Récupérer le feed (tous les posts publics)
 */
router.get("/", async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Récupérer les posts
    const posts = await Post.find({ visibility: "public" })
      .sort({ createdAt: -1 }) // Plus récents en premier
      .skip(skip)
      .limit(limit);

    // Compter le total
    const total = await Post.countDocuments({ visibility: "public" });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération posts:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : GET /api/posts/:id
 * Récupérer un post spécifique
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    res.json(post);
  } catch (error) {
    console.error("Erreur récupération post:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : PUT /api/posts/:id
 * Modifier un post
 */
router.put("/:id", authRequired, async (req, res) => {
  try {
    const { content, images } = req.body;
    const userId = req.userId;

    // Récupérer le post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Vérifier que c'est le propriétaire
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        error: "Non autorisé à modifier ce post",
      });
    }

    // Mettre à jour
    if (content) post.content = content;
    if (images) post.images = images;
    post.updatedAt = Date.now();

    await post.save();

    res.json({
      message: "Post mis à jour",
      post,
    });
  } catch (error) {
    console.error("Erreur modification post:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : DELETE /api/posts/:id
 * Supprimer un post
 */
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const userId = req.userId;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Vérifier le propriétaire
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        error: "Non autorisé à supprimer ce post",
      });
    }

    await post.deleteOne();

    res.json({ message: "Post supprimé" });
  } catch (error) {
    console.error("Erreur suppression post:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : GET /api/posts/user/:userId
 * Récupérer tous les posts d'un utilisateur
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (error) {
    console.error("Erreur récupération posts utilisateur:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : POST /api/posts/:id/like
 * Liker un post (auth requis, 1 like par utilisateur)
 */
router.post("/:id/like", authRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    if (post.hasLiked(userId)) {
      return res.status(400).json({
        error: "Vous avez déjà liké ce post",
        likesCount: post.likesCount,
      });
    }

    await post.addLike(userId);

    res.json({
      message: "Post liké",
      likesCount: post.likesCount,
      hasLiked: true,
    });
  } catch (error) {
    console.error("Erreur like post:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE : POST /api/posts/:id/unlike
 * Retirer le like d'un post (auth requis)
 */

router.post("/:id/unlike", authRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    if (!post.hasLiked(userId)) {
      return res.status(400).json({
        error: "Vous n'avez pas liké ce post",
        likesCount: post.likesCount,
      });
    }

    await post.removeLike(userId);

    res.json({
      message: "Post déliké",
      likesCount: post.likesCount,
      hasLiked: false,
    });
  } catch (error) {
    console.error("Erreur unlike post:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
