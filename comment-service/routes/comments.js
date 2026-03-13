const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const authRequired = require("../middleware/auth");

router.post("/", authRequired, async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const userId = req.userId;

    if (!postId || !content) {
      return res.status(400).json({
        error: "postId et content sont requis",
      });
    }

    const comment = new Comment({
      postId,
      userId,
      content,
      parentCommentId: parentCommentId || null,
    });

    await comment.save();

    res.status(201).json({
      message: "Commentaire créé",
      comment,
    });
  } catch (error) {
    console.error("Erreur création commentaire:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { postId, page, limit } = req.query;

    if (!postId) {
      return res.status(400).json({
        error: "postId est requis dans la query",
      });
    }

    const currentPage = parseInt(page) || 1;
    const currentLimit = parseInt(limit) || 20;
    const skip = (currentPage - 1) * currentLimit;

    const query = { postId, parentCommentId: null };

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit);

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        pages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération commentaires:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
      parentCommentId: null,
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error("Erreur récupération commentaires post:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/replies", async (req, res) => {
  try {
    const replies = await Comment.find({
      parentCommentId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    console.error("Erreur récupération réponses:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    res.json(comment);
  } catch (error) {
    console.error("Erreur récupération commentaire:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authRequired, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({ error: "content est requis" });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        error: "Non autorisé à modifier ce commentaire",
      });
    }

    comment.content = content;
    comment.updatedAt = Date.now();

    await comment.save();

    res.json({
      message: "Commentaire mis à jour",
      comment,
    });
  } catch (error) {
    console.error("Erreur modification commentaire:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authRequired, async (req, res) => {
  try {
    const userId = req.userId;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        error: "Non autorisé à supprimer ce commentaire",
      });
    }

    await Comment.deleteMany({ parentCommentId: comment._id });
    await comment.deleteOne();

    res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error("Erreur suppression commentaire:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
