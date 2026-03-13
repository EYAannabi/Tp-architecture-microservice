const errorHandler = (err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ error: "Erreur serveur interne" });
};

module.exports = errorHandler;
