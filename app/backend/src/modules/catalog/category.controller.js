const categoryService = require("./category.service");

const getCategories = async (req, res) => {
  const categories = await categoryService.getCategories();
  res.json({ success: true, data: categories });
};

const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: category, message: "Categoría creada" });
};

const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(parseInt(req.params.id), req.body);
  res.json({ success: true, data: category, message: "Categoría actualizada" });
};

module.exports = { getCategories, createCategory, updateCategory };
