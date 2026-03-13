require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ ERREUR : MONGODB_URI absent du fichier .env");
  process.exit(1);
}

console.log("⏳ Tentative de connexion...");

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connexion MongoDB réussie !");
    console.log("🚀 Votre Phase 1 est validée.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Échec de la connexion :", err.message);
    process.exit(1);
  });