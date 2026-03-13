const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config({ path: "../.env" }); // IMPORTANT: Chemin vers le .env racine

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

// Tentative de connexion avec log d'erreur détaillé
console.log("Tentative de connexion à MongoDB...");
console.log("URI utilisée :", process.env.MONGODB_URI); // Log de l'URI pour vérifier
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ User Service: MongoDB connecté avec succès"))
  .catch((err) => {
    console.error("❌ ERREUR CRITIQUE MONGODB :", err.message);
    console.error("Vérifiez votre fichier .env et votre accès réseau.");
    process.exit(1);
  });

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "user-service" }),
);
app.use("/api/users", require("./routes/users"));
app.use(errorHandler);

const PORT = process.env.USER_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`👤 User Service démarré sur le port ${PORT}`);
});
