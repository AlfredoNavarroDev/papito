const prisma = require("../../config/database");

const findAllByUserId = (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });
};

const findById = (id) => {
  return prisma.address.findUnique({ where: { id } });
};

const create = (data) => {
  return prisma.address.create({ data });
};

const update = (id, data) => {
  return prisma.address.update({ where: { id }, data });
};

const remove = (id) => {
  return prisma.address.delete({ where: { id } });
};

const unsetDefaultByUserId = (userId) => {
  return prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
};

module.exports = { findAllByUserId, findById, create, update, remove, unsetDefaultByUserId };
