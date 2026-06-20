const AppError = require("../../shared/utils/app-error");
const categoryRepository = require("./category.repository");

const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const getCategories = async () => {
  return categoryRepository.findAll();
};

const createCategory = async ({ name }) => {
  const slug = slugify(name);
  const existing = await categoryRepository.findBySlug(slug);
  if (existing) {
    throw new AppError(409, "CONFLICT", "La categoría ya existe");
  }
  return categoryRepository.create({ name, slug });
};

const updateCategory = async (id, { name }) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new AppError(404, "NOT_FOUND", "Categoría no encontrada");
  }

  const data = {};
  if (name) {
    data.name = name;
    data.slug = slugify(name);

    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing && existing.id !== id) {
      throw new AppError(409, "CONFLICT", "Ya existe una categoría con ese nombre");
    }
  }

  return categoryRepository.update(id, data);
};

module.exports = { getCategories, createCategory, updateCategory };
