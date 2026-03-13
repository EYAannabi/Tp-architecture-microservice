const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config({ path: "../.env" }); // Chemin correct vers la racine

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Connexion MongoDB (Simplifiée comme pour le User Service)
console.log("Tentative de connexion à MongoDB pour Post Service...");
console.log("URI utilisée :", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Post Service: MongoDB connecté avec succès");
  })
  .catch((err) => {
    console.error("❌ ERREUR CRITIQUE MONGODB (Post Service) :", err.message);
    process.exit(1);
  });

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "post-service",
    timestamp: new Date(),
  });
});

// Importation des routes de publications
app.use("/api/posts", require("./routes/posts"));

// Middleware de gestion d'erreurs global
app.use(errorHandler);

// Démarrage
const PORT = process.env.POST_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`📝 Post Service démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
