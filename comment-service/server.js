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

console.log("Tentative de connexion à MongoDB pour Comment Service...");
console.log("URI utilisée :", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Comment Service: MongoDB connecté avec succès");
  })
  .catch((err) => {
    console.error("❌ ERREUR CRITIQUE MONGODB (Comment Service) :", err.message);
    process.exit(1);
  });

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "comment-service",
    timestamp: new Date(),
  });
});

app.use("/api/comments", require("./routes/comments"));

app.use(errorHandler);

const PORT = process.env.COMMENT_SERVICE_PORT || 3004;
app.listen(PORT, () => {
  console.log(`💬 Comment Service démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
