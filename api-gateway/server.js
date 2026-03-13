const express = require("express");
// const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const applySecurityMiddleware = require("./middleware/security");
const authMiddleware = require("./middleware/auth");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
// require('dotenv').config();
require("dotenv").config({ path: "../.env" });
const app = express();

/**
 * MIDDLEWARES DE SÉCURITÉ
 */

applySecurityMiddleware(app);

/**
 * RATE LIMITING
 * Limite le nombre de requêtes par IP
 */
console.log("LA CLÉ SECRÈTE DE LA GATEWAY EST :", process.env.JWT_SECRET);

// Appliquer l'authentification
app.use(authMiddleware);

/**
 * LOGGING MIDDLEWARE
 * Log toutes les requêtes
 */
app.use(logger);

/**
 * PROXIES VERS LES MICROSERVICES
 * Redirige les requêtes vers les services appropriés
 */

// User Service
app.use(
  "/api/users",
  createProxyMiddleware({
    target: `http://localhost:${process.env.USER_SERVICE_PORT || 3001}`,
    changeOrigin: true,
    onProxyReq: fixRequestBody, // <--- AJOUTEZ CETTE LIGNE
    onError: (err, req, res) => {
      console.error("Erreur User Service:", err);
      res.status(503).json({ error: "User Service indisponible" });
    },
  }),
);

// Post Service
app.use(
  "/api/posts",
  createProxyMiddleware({
    target: `http://localhost:${process.env.POST_SERVICE_PORT || 3002}`,
    changeOrigin: true,
    onProxyReq: fixRequestBody, // <--- AJOUTEZ CETTE LIGNE
    onError: (err, req, res) => {
      console.error("Erreur Post Service:", err);
      res.status(503).json({ error: "Post Service indisponible" });
    },
  }),
);

// Comment Service
app.use(
  "/api/comments",
  createProxyMiddleware({
    target: `http://localhost:${process.env.COMMENT_SERVICE_PORT || 3004}`,
    changeOrigin: true,
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      console.error("Erreur Comment Service:", err);
      res.status(503).json({ error: "Comment Service indisponible" });
    },
  }),
);

// Story Service (à implémenter)
app.use(
  "/api/stories",
  createProxyMiddleware({
    target: `http://localhost:${process.env.STORY_SERVICE_PORT || 3003}`,
    changeOrigin: true,
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      console.error("Erreur Story Service:", err);
      res.status(503).json({
        error: "Story Service indisponible",
      });
    },
  }),
);

/**
 * ROUTES GATEWAY
 */

// Health check global
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date(),
    services: {
      users: `http://localhost:${process.env.USER_SERVICE_PORT}`,
      posts: `http://localhost:${process.env.POST_SERVICE_PORT}`,
      comments: `http://localhost:${process.env.COMMENT_SERVICE_PORT}`,
      stories: `http://localhost:${process.env.STORY_SERVICE_PORT}`,
    },
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
  });
});

/**
 * GESTION GLOBALE DES ERREURS
 */
app.use(errorHandler);

/**
 * DÉMARRAGE DU SERVEUR
 */
const PORT = process.env.API_GATEWAY_PORT || 3000;

app.listen(PORT, () => {
  console.log(`📦 API Gateway démarré sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log("\n🚀 Services proxifiés:");
  console.log(
    `- User Service: http://localhost:${process.env.USER_SERVICE_PORT || 3001}`,
  );
  console.log(
    `- Post Service: http://localhost:${process.env.POST_SERVICE_PORT || 3002}`,
  );
  console.log(
    `- Comment Service: http://localhost:${process.env.COMMENT_SERVICE_PORT || 3004}`,
  );
  console.log(
    `- Story Service: http://localhost:${process.env.STORY_SERVICE_PORT || 3003}`,
  );
});
