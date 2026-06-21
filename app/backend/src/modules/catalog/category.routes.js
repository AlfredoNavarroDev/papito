const { Router } = require("express");
const { body, param } = require("express-validator");
const categoryController = require("./category.controller");
const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/roles.middleware");
const validate = require("../../shared/validators/validate");

const router = Router();

router.get("/", categoryController.getCategories);

router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  [body("name").notEmpty().withMessage("Nombre requerido"), validate],
  categoryController.createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  [
    param("id").isInt().withMessage("ID inválido"),
    body("name").notEmpty().withMessage("Nombre requerido"),
    validate,
  ],
  categoryController.updateCategory
);


module.exports = router;
