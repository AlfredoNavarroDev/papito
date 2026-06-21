const paymentService = require("./payment.service");

const createPreference = async (req, res) => {
  const result = await paymentService.createPreference(req.user.id, parseInt(req.body.orderId));
  res.json({ success: true, data: result, message: "Preferencia de pago creada" });
};

const handleWebhook = async (req, res) => {
  await paymentService.handleWebhook(req.body);
  res.status(200).json({ success: true });
};

const getPaymentByOrder = async (req, res) => {
  const payment = await paymentService.getPaymentByOrder(req.user.id, parseInt(req.params.orderId));
  res.json({ success: true, data: payment });
};

module.exports = { createPreference, handleWebhook, getPaymentByOrder };
