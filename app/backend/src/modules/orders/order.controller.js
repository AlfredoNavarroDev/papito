const orderService = require("./order.service");

const getOrders = async (req, res) => {
  const orders = await orderService.getOrders(req.user);
  res.json({ success: true, data: orders });
};

const getOrder = async (req, res) => {
  const order = await orderService.getOrder(parseInt(req.params.id), req.user);
  res.json({ success: true, data: order });
};

const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({ success: true, data: order, message: "Pedido creado exitosamente" });
};

const updateOrderStatus = async (req, res) => {
  const order = await orderService.updateOrderStatus(parseInt(req.params.id), req.body.status);
  res.json({ success: true, data: order, message: "Estado del pedido actualizado" });
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus };
