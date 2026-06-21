const prisma = require("../../config/database");

const findAll = (filters = {}) => {
  const where = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  return prisma.order.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      address: true,
      items: {
        include: {
          product: true,
          productSize: true,
          modifiers: {
            include: { modifier: true },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const findById = (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      address: true,
      items: {
        include: {
          product: true,
          productSize: true,
          modifiers: {
            include: { modifier: true },
          },
        },
      },
      payment: true,
    },
  });
};

const create = (data) => {
  return prisma.order.create({
    data,
    include: {
      items: {
        include: {
          product: true,
          productSize: true,
          modifiers: {
            include: { modifier: true },
          },
        },
      },
      payment: true,
    },
  });
};

const updateStatus = (id, status) => {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

module.exports = { findAll, findById, create, updateStatus };
