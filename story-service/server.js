const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config({ path: "../.env" });

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

console.log("Tentative de connexion à MongoDB pour Story Service...");
console.log("URI utilisée :", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Story Service: MongoDB connecté avec succès");
  })
  .catch((err) => {
    console.error("❌ ERREUR CRITIQUE MONGODB (Story Service) :", err.message);
    process.exit(1);
  });

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "story-service",
    timestamp: new Date(),
  });
});

app.use("/api/stories", require("./routes/stories"));

app.use(errorHandler);

const PORT = process.env.STORY_SERVICE_PORT || 3003;
app.listen(PORT, () => {
  console.log(`📚 Story Service démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
