const AppError = require("../../shared/utils/app-error");
const addressRepository = require("./address.repository");

const getAddresses = async (userId) => {
  return addressRepository.findAllByUserId(userId);
};

const getAddress = async (id, userId) => {
  const address = await addressRepository.findById(id);

  if (!address) {
    throw new AppError(404, "NOT_FOUND", "Direccion no encontrada");
  }

  if (address.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para acceder a esta direccion");
  }

  return address;
};

const createAddress = async (userId, data) => {
  const { street, city, reference, isDefault } = data;

  if (!street || !city) {
    throw new AppError(400, "VALIDATION_ERROR", "Calle y ciudad son requeridos");
  }

  if (isDefault) {
    await addressRepository.unsetDefaultByUserId(userId);
  }

  return addressRepository.create({
    userId,
    street,
    city,
    reference: reference || null,
    isDefault: isDefault || false,
  });
};

const updateAddress = async (id, userId, data) => {
  const address = await addressRepository.findById(id);

  if (!address) {
    throw new AppError(404, "NOT_FOUND", "Direccion no encontrada");
  }

  if (address.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para modificar esta direccion");
  }

  if (data.isDefault) {
    await addressRepository.unsetDefaultByUserId(userId);
  }

  return addressRepository.update(id, data);
};

const deleteAddress = async (id, userId) => {
  const address = await addressRepository.findById(id);

  if (!address) {
    throw new AppError(404, "NOT_FOUND", "Direccion no encontrada");
  }

  if (address.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para eliminar esta direccion");
  }

  return addressRepository.remove(id);
};

module.exports = { getAddresses, getAddress, createAddress, updateAddress, deleteAddress };
