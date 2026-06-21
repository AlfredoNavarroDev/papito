const { Router } = require("express");
const { body, param } = require("express-validator");
const addressController = require("./address.controller");
const authenticate = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/validators/validate");

const router = Router();

router.use(authenticate);

router.get("/", addressController.getAddresses);

router.get(
  "/:id",
  [param("id").isInt().withMessage("ID invalido"), validate],
  addressController.getAddress
);

router.post(
  "/",
  [
    body("street").notEmpty().withMessage("Calle requerida"),
    body("city").notEmpty().withMessage("Ciudad requerida"),
    body("reference").optional().isString(),
    body("isDefault").optional().isBoolean(),
    validate,
  ],
  addressController.createAddress
);

router.put(
  "/:id",
  [
    param("id").isInt().withMessage("ID invalido"),
    body("street").optional().notEmpty().withMessage("Calle no puede estar vacia"),
    body("city").optional().notEmpty().withMessage("Ciudad no puede estar vacia"),
    body("reference").optional().isString(),
    body("isDefault").optional().isBoolean(),
    validate,
  ],
  addressController.updateAddress
);

router.delete(
  "/:id",
  [param("id").isInt().withMessage("ID invalido"), validate],
  addressController.deleteAddress
);

module.exports = router;
