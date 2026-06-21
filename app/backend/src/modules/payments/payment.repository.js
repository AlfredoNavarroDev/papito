const prisma = require("../../config/database");

const findByOrderId = (orderId) => {
  return prisma.payment.findUnique({ where: { orderId } });
};

const create = (data) => {
  return prisma.payment.create({ data });
};

const updateByOrderId = (orderId, data) => {
  return prisma.payment.update({ where: { orderId }, data });
};

module.exports = { findByOrderId, create, updateByOrderId };
