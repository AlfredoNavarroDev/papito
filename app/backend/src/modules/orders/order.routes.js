const { Router } = require("express");
const { body, param } = require("express-validator");
const orderController = require("./order.controller");
const authenticate = require("../../shared/middlewares/auth.middleware");
const authorize = require("../../shared/middlewares/roles.middleware");
const validate = require("../../shared/validators/validate");

const router = Router();

router.use(authenticate);

router.get("/", orderController.getOrders);

router.get(
  "/:id",
  [param("id").isInt().withMessage("ID invalido"), validate],
  orderController.getOrder
);

router.post(
  "/",
  [
    body("deliveryType")
      .isIn(["DELIVERY", "LOCAL"])
      .withMessage("Tipo de entrega invalido"),
    body("addressId")
      .optional({ values: "null" })
      .isInt()
      .withMessage("Direccion invalida"),
    body("notes").optional().isString(),
    body("items").isArray({ min: 1 }).withMessage("Debe incluir al menos un producto"),
    body("items.*.productId").isInt().withMessage("Producto invalido"),
    body("items.*.productSizeId").optional({ values: "null" }).isInt(),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Cantidad debe ser mayor a 0"),
    body("items.*.modifiers").optional().isArray(),
    validate,
  ],
  orderController.createOrder
);

router.patch(
  "/:id/status",
  authorize("OWNER", "ADMIN"),
  [
    param("id").isInt().withMessage("ID invalido"),
    body("status")
      .isIn(["PENDING", "PAID", "PREPARING", "READY", "DELIVERED"])
      .withMessage("Estado invalido"),
    validate,
  ],
  orderController.updateOrderStatus
);

module.exports = router;
