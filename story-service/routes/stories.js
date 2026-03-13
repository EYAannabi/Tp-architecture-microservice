const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const authRequired = require("../middleware/auth");

router.post("/", authRequired, async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, visibility, expiresInHours } =
      req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({
        error: "content est requis",
      });
    }

    const duration = Math.min(Math.max(parseInt(expiresInHours) || 24, 1), 48);
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    const story = new Story({
      userId,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || "none",
      visibility: visibility || "public",
      expiresAt,
    });

    await story.save();

    res.status(201).json({
      message: "Story créée",
      story,
    });
  } catch (error) {
    console.error("Erreur création story:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {
      visibility: "public",
      expiresAt: { $gt: new Date() },
    };

    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments(query);

    res.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération stories:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const stories = await Story.find({
      userId: req.params.userId,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    console.error("Erreur récupération stories utilisateur:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      expiresAt: { $gt: new Date() },
    });

    if (!story) {
      return res.status(404).json({ error: "Story non trouvée ou expirée" });
    }

    res.json(story);
  } catch (error) {
    console.error("Erreur récupération story:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/view", authRequired, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
      expiresAt: { $gt: new Date() },
    });

    if (!story) {
      return res.status(404).json({ error: "Story non trouvée ou expirée" });
    }

    await story.addView(req.userId);

    res.json({
      message: "Vue enregistrée",
      viewsCount: story.viewsCount,
      hasViewed: true,
    });
  } catch (error) {
    console.error("Erreur vue story:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authRequired, async (req, res) => {
  try {
    const userId = req.userId;

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ error: "Story non trouvée" });
    }

    if (story.userId.toString() !== userId) {
      return res.status(403).json({
        error: "Non autorisé à supprimer cette story",
      });
    }

    await story.deleteOne();

    res.json({ message: "Story supprimée" });
  } catch (error) {
    console.error("Erreur suppression story:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
