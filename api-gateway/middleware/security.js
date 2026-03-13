const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const applySecurityMiddleware = (app) => {
  app.use(helmet());

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: "Trop de requêtes, veuillez réessayer plus tard",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);
};

module.exports = applySecurityMiddleware;
