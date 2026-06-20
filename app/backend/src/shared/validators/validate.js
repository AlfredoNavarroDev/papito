const { validationResult } = require("express-validator");
const AppError = require("../utils/app-error");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new AppError(400, "VALIDATION_ERROR", "Datos inválidos", details);
  }
  next();
};

module.exports = validate;
