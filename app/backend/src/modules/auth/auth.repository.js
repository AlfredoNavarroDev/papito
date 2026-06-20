const prisma = require("../../config/database");

const findByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

const findByGoogleId = (googleId) => {
  return prisma.user.findUnique({ where: { googleId } });
};

const findById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      googleId: true,
      createdAt: true,
    },
  });
};

const create = (data) => {
  return prisma.user.create({ data });
};

const update = (id, data) => {
  return prisma.user.update({ where: { id }, data });
};

module.exports = { findByEmail, findByGoogleId, findById, create, update };
