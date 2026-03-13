const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const publicRoutes = ["/api/users/register", "/api/users/login", "/health"];
  const isPublicRoute = publicRoutes.some((route) => req.path.includes(route));

  if (isPublicRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Token manquant",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Format de token invalide",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token invalide ou expiré",
    });
  }
};

module.exports = authMiddleware;
