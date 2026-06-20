const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const AppError = require("../utils/app-error");

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Token no proporcionado");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError(401, "UNAUTHORIZED", "Token inválido o expirado");
  }
};

module.exports = authenticate;
