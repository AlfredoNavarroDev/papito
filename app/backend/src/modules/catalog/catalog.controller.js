const catalogService = require("./catalog.service");

const getProducts = async (req, res) => {
  const { categoryId, productType, page, limit } = req.query;
  const result = await catalogService.getProducts({ categoryId: categoryId ? parseInt(categoryId) : undefined, productType, page, limit });
  res.json({ success: true, data: result.products, pagination: result.pagination });
};

const getProduct = async (req, res) => {
  const product = await catalogService.getProduct(parseInt(req.params.id));
  res.json({ success: true, data: product });
};

const createProduct = async (req, res) => {
  const product = await catalogService.createProduct(req.body);
  res.status(201).json({ success: true, data: product, message: "Producto creado" });
};

const updateProduct = async (req, res) => {
  const product = await catalogService.updateProduct(parseInt(req.params.id), req.body);
  res.json({ success: true, data: product, message: "Producto actualizado" });
};

const updateStock = async (req, res) => {
  const product = await catalogService.updateStock(parseInt(req.params.id), req.body.stock);
  res.json({ success: true, data: product, message: "Stock actualizado" });
};

const deleteProduct = async (req, res) => {
  await catalogService.deleteProduct(parseInt(req.params.id));
  res.json({ success: true, message: "Producto eliminado" });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, updateStock, deleteProduct };
