const prisma = require("../../config/database");

const findAll = () => {
  return prisma.category.findMany({
    include: { products: { where: { isActive: true }, select: { id: true } } },
    orderBy: { name: "asc" },
  });
};

const findById = (id) => {
  return prisma.category.findUnique({ where: { id } });
};

const findBySlug = (slug) => {
  return prisma.category.findUnique({ where: { slug } });
};

const create = (data) => {
  return prisma.category.create({ data });
};

const update = (id, data) => {
  return prisma.category.update({ where: { id }, data });
};

module.exports = { findAll, findById, findBySlug, create, update };
