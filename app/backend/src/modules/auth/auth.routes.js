const { Router } = require("express");
const { body } = require("express-validator");
const authController = require("./auth.controller");
const authenticate = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/validators/validate");

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("name").notEmpty().withMessage("Nombre requerido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password debe tener al menos 6 caracteres"),
    validate,
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Password requerido"),
    validate,
  ],
  authController.login
);

router.post(
  "/google",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("googleId").notEmpty().withMessage("Google ID requerido"),
    validate,
  ],
  authController.googleAuth
);

router.get("/me", authenticate, authController.getProfile);

module.exports = router;
