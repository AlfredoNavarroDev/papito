const addressService = require("./address.service");

const getAddresses = async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  res.json({ success: true, data: addresses });
};

const getAddress = async (req, res) => {
  const address = await addressService.getAddress(parseInt(req.params.id), req.user.id);
  res.json({ success: true, data: address });
};

const createAddress = async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(201).json({ success: true, data: address, message: "Direccion creada" });
};

const updateAddress = async (req, res) => {
  const address = await addressService.updateAddress(parseInt(req.params.id), req.user.id, req.body);
  res.json({ success: true, data: address, message: "Direccion actualizada" });
};

const deleteAddress = async (req, res) => {
  await addressService.deleteAddress(parseInt(req.params.id), req.user.id);
  res.json({ success: true, message: "Direccion eliminada" });
};

module.exports = { getAddresses, getAddress, createAddress, updateAddress, deleteAddress };
