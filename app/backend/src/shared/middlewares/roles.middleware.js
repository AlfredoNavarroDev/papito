const AppError = require("../utils/app-error");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "No autenticado");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "FORBIDDEN", "No tienes permisos para esta acción");
    }

    next();
  };
};

module.exports = authorize;
