const { Router } = require("express");
const { body, param } = require("express-validator");
const paymentController = require("./payment.controller");
const authenticate = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/validators/validate");

const router = Router();

router.post(
  "/create-preference",
  authenticate,
  [
    body("orderId").isInt().withMessage("ID de pedido requerido"),
    validate,
  ],
  paymentController.createPreference
);

router.post("/webhook", paymentController.handleWebhook);

router.get(
  "/:orderId",
  authenticate,
  [param("orderId").isInt().withMessage("ID de pedido invalido"), validate],
  paymentController.getPaymentByOrder
);

module.exports = router;
