const AppError = require("../../shared/utils/app-error");
const catalogRepository = require("./catalog.repository");

const getProducts = async (filters) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const query = { ...filters, page, limit };

  const [products, total] = await Promise.all([
    catalogRepository.findAll(query),
    catalogRepository.count(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProduct = async (id) => {
  const product = await catalogRepository.findById(id);
  if (!product || !product.isActive) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }
  return product;
};

const createProduct = async (data) => {
  return catalogRepository.create(data);
};

const updateProduct = async (id, data) => {
  const product = await catalogRepository.findById(id);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }
  return catalogRepository.update(id, data);
};

const updateStock = async (id, stock) => {
  const product = await catalogRepository.findById(id);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }
  if (stock < 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Stock no puede ser negativo");
  }
  return catalogRepository.updateStock(id, stock);
};

const deleteProduct = async (id) => {
  const product = await catalogRepository.findById(id);
  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Producto no encontrado");
  }
  return catalogRepository.softDelete(id);
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, updateStock, deleteProduct };
