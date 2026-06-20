const prisma = require("../../config/database");

const findAll = ({ categoryId, productType, page = 1, limit = 20 }) => {
  const where = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (productType) where.productType = productType;

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      sizes: true,
      modifiers: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

const count = ({ categoryId, productType }) => {
  const where = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (productType) where.productType = productType;

  return prisma.product.count({ where });
};

const findById = (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      sizes: true,
      modifiers: true,
    },
  });
};

const create = (data) => {
  return prisma.product.create({
    data,
    include: { category: true, sizes: true, modifiers: true },
  });
};

const update = (id, data) => {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true, sizes: true, modifiers: true },
  });
};

const updateStock = (id, stock) => {
  return prisma.product.update({
    where: { id },
    data: { stock },
  });
};

const softDelete = (id) => {
  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};

module.exports = { findAll, count, findById, create, update, updateStock, softDelete };
