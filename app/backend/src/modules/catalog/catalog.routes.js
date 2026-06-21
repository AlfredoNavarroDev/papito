const { Router } = require("express");
const { body, param } = require("express-validator");
const catalogController = require("./catalog.controller");
const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/roles.middleware");
const validate = require("../../shared/validators/validate");

const router = Router();

router.get("/", catalogController.getProducts);

router.get(
  "/:id",
  [param("id").isInt().withMessage("ID inválido"), validate],
  catalogController.getProduct
);

router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  [
    body("name").notEmpty().withMessage("Nombre requerido"),
    body("categoryId").isInt().withMessage("Categoría requerida"),
    body("productType").notEmpty().withMessage("Tipo de producto requerido"),
    body("basePrice").isDecimal().withMessage("Precio base requerido"),
    validate,
  ],
  catalogController.createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  [
    param("id").isInt().withMessage("ID inválido"),
    body("name").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("basePrice").optional().isDecimal().withMessage("Precio debe ser decimal"),
    validate,
  ],
  catalogController.updateProduct
);

router.patch(
  "/:id/stock",
  authenticate,
  authorize("OWNER", "ADMIN"),
  [
    param("id").isInt().withMessage("ID inválido"),
    body("stock").isInt({ min: 0 }).withMessage("Stock debe ser entero >= 0"),
    validate,
  ],
  catalogController.updateStock
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  [param("id").isInt().withMessage("ID inválido"), validate],
  catalogController.deleteProduct
);


module.exports = router;
