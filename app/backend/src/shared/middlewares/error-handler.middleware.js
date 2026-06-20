const AppError = require("../utils/app-error");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    const response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err.details) {
      response.error.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  console.error(err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
    },
  });
};

module.exports = errorHandler;
